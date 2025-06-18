<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // ✅ Jeśli zapytanie dotyczy macierzy — zwróć tylko tablicę 8x8
    if (isset($_GET['matrix'])) {
        $matrixFile = 'matrix_state.json';
        if (file_exists($matrixFile)) {
            $raw = file_get_contents($matrixFile);
            $json = json_decode($raw, true);
            if (isset($json['matrix']) && is_array($json['matrix'])) {
                echo json_encode($json['matrix']);
            } else {
                http_response_code(400);
                echo json_encode(["error" => "Invalid matrix data"]);
            }
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Matrix state not found"]);
        }
        exit;
    }

    // Inne argumenty: T, H, P itd.
    $args = '';
    if (isset($_GET['T'])) $args .= ' -T';
    if (isset($_GET['H'])) $args .= ' -H';
    if (isset($_GET['P'])) $args .= ' -P';
    if (isset($_GET['r'])) $args .= ' -r';
    if (isset($_GET['p'])) $args .= ' -p';
    if (isset($_GET['y'])) $args .= ' -y';
    $args .= ' --T_unit=C --H_unit=percent --P_unit=hPa';
    $cmd = "python3 read_sensors.py$args";
    $data = shell_exec($cmd);

    $decoded = json_decode($data, true);

    // Zapisuj log tylko jeśli temperatura jest poprawna
    $logfile = 'sensor_log.json';
    $log_entry = ['timestamp' => date('H:i:s')];
    
    foreach (['temperature', 'humidity', 'pressure', 'roll', 'pitch', 'yaw'] as $key) {
        if (isset($decoded[$key]['value'])) {
            $log_entry[$key] = $decoded[$key]['value'];
        }
    }
    
    $log_array = file_exists($logfile) ? json_decode(file_get_contents($logfile), true) : [];
    $log_array[] = $log_entry;
    file_put_contents($logfile, json_encode($log_array, JSON_PRETTY_PRINT));
    

    echo $data;
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents("php://input");
    file_put_contents("matrix_state.json", $rawData);

    // Debuguj wynik działania
    $cmd = "echo " . escapeshellarg($rawData) . " | python3 set_ledmatrix_cli.py 2>&1";
    $result = shell_exec($cmd);

    echo json_encode([
        "status" => "executed",
        "command" => $cmd,
        "output" => $result
    ]);
}
?>
