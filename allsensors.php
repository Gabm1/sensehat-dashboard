<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
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

    if (isset($decoded['temperature']['value'])) {
        $logfile = 'sensor_log.json';
        $log_entry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'temperature' => $decoded['temperature']['value']
        ];
        $log_array = file_exists($logfile) ? json_decode(file_get_contents($logfile), true) : [];
        $log_array[] = $log_entry;
        file_put_contents($logfile, json_encode($log_array, JSON_PRETTY_PRINT));
    }

    echo $data;
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents("php://input");
    file_put_contents("matrix_state.json", $rawData);
    $result = shell_exec("echo " . escapeshellarg($rawData) . " | python3 set_ledmatrix_cli.py");
    echo $result;
}
?>