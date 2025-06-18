$(document).ready(function () {
  let pixelGrid = [];
  loadSensorLog();
  $('#sensor-select').change(loadSensorLog);

  function updateSensorData() {
    $.get('allsensors.php?T=1&H=1&P=1&r=1&p=1&y=1', function (data) {
      $('#sensor-data').empty();

      $.each(data, function (key, value) {
        if (key.toLowerCase() === 'joystick' && Array.isArray(value)) {
          if (value.length > 0) {
            const entry = value[value.length - 1];  // ostatni
            const dir = entry.direction || 'middle';
            const act = entry.action || '';
            const icon = {
              up: '↑',
              down: '↓',
              left: '←',
              right: '→',
              middle: '⬤'
            }[dir] || '?';
            $('#sensor-data').append(`<div>Joystick: ${icon} (${dir}, ${act})</div>`);
          }
          
        } else if (typeof value === 'object' && value !== null && 'value' in value) {
          $('#sensor-data').append(`<div>${key}: ${value.value} ${value.unit}</div>`);
        } else {
          $('#sensor-data').append(`<div>${key}: ${JSON.stringify(value)}</div>`);
        }
      });
    });
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }
  function loadSensorLog() {
    const selectedSensor = $('#sensor-select').val();
  
    fetch('sensor_log.json')
      .then(res => res.json())
      .then(log => {
        const recent = log.slice(-50);
        const labels = recent.map(e => e.timestamp);
        const data = recent.map(e => e[selectedSensor] ?? null);  // null jeśli brak
  
        const ctx = document.getElementById('tempChart').getContext('2d');
        if (window.tempChartInstance) {
          tempChartInstance.data.labels = labels;
          tempChartInstance.data.datasets[0].label = `${selectedSensor} log`;
          tempChartInstance.data.datasets[0].data = data;
          tempChartInstance.update();
        } else {
          window.tempChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
              labels,
              datasets: [{
                label: `${selectedSensor} log`,
                data,
                borderColor: 'blue',
                backgroundColor: 'rgba(0, 0, 255, 0.2)',
                tension: 0.3,
                pointRadius: 2
              }]
            }
          });
        }
      })
      .catch(err => console.error("Error loading log:", err));
  }
  
  
  function buildLedMatrix() {
    const matrix = $('#led-matrix');
    matrix.empty();
    pixelGrid = [];

    for (let y = 0; y < 8; y++) {
      const row = [];
      for (let x = 0; x < 8; x++) {
        const pixel = $('<div></div>')
          .addClass('led-pixel')
          .css({ backgroundColor: '#000' })
          .data('coords', { x, y })
          .data('color', { r: 0, g: 0, b: 0 })
          .click(function () {
            const rgb = hexToRgb($('#color-picker').val());
            $(this).css('backgroundColor', `rgb(${rgb.r},${rgb.g},${rgb.b})`);
            $(this).data('color', rgb);
          });
        matrix.append(pixel);
        row.push(pixel);
      }
      pixelGrid.push(row);
    }
  }

  function loadMatrixFromServer() {
    $.getJSON('allsensors.php?matrix=1', function (data) {
      if (Array.isArray(data) && data.length === 8) {
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            const pixel = data[y][x];
            pixelGrid[y][x]
              .css('backgroundColor', `rgb(${pixel.r},${pixel.g},${pixel.b})`)
              .data('color', pixel);
          }
        }
      } else {
        alert("Invalid matrix data received.");
      }
    });
  }

  function updateMatrixToServer() {
    const matrix = pixelGrid.map(row => row.map(pixel => pixel.data('color')));
    fetch('allsensors.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Matrix update response:", data);
    })
    .catch(err => {
      console.error("Matrix send error:", err);
      alert("Matrix send failed");
    });
  }

  function clearMatrix() {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const color = { r: 0, g: 0, b: 0 };
        pixelGrid[y][x]
          .css('backgroundColor', 'rgb(0,0,0)')
          .data('color', color);
      }
    }
    updateMatrixToServer();
  }

  buildLedMatrix();
  updateSensorData();
  loadMatrixFromServer();

  $('#load-matrix-button').click(loadMatrixFromServer);
  $('#update-matrix-button').click(updateMatrixToServer);
  $('#clear-matrix-button').click(clearMatrix);

  // ⏱ Automatyczne odświeżanie co 5 sekund
  setInterval(() => {
    updateSensorData();
    loadMatrixFromServer();
    loadSensorLog();
  }, 1000);
});
