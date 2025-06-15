
$(document).ready(function () {
  let pixelGrid = [];

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

 function buildLedMatrix() {
  const matrix = $('#led-matrix');
  matrix.empty();
  pixelGrid = [];

  for (let y = 0; y < 8; y++) {
    const row = $('<div></div>').css({ display: 'flex' });
    const rowData = [];

    for (let x = 0; x < 8; x++) {
      const pixel = $('<div></div>')
        .addClass('led-pixel')
        .css({
          width: '30px',
          height: '30px',
          backgroundColor: '#000',
          cursor: 'pointer',
          borderRadius: '4px',
          border: '1px solid #000',
          margin: '1px'
        })
        .data('coords', { x, y })
        .data('color', { r: 0, g: 0, b: 0 })
        .click(function () {
          const color = $('#color-picker').val();
          const { r, g, b } = hexToRgb(color);
          $(this)
            .css('backgroundColor', color)
            .data('color', { r, g, b });
        });

      row.append(pixel);
      rowData.push(pixel);
    }

    matrix.append(row);
    pixelGrid.push(rowData);
  }
}


  function updateMatrixToServer() {
    const matrix = [];

    for (let y = 0; y < 8; y++) {
      const row = [];
      for (let x = 0; x < 8; x++) {
        const color = pixelGrid[y][x].data('color') || { r: 0, g: 0, b: 0 };
        row.push({ r: color.r, g: color.g, b: color.b });
      }
      matrix.push(row);
    }

    fetch('allsensors.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix })
    });
  }

  $('#update-matrix-button').click(updateMatrixToServer);
  buildLedMatrix();
});
