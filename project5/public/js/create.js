// set global variables
let currentPetalCount, currentPetalColor, currentCenterColor, currentShape;

function setup() {
  // get body element
  const body = document.body;
  // petal amount
  currentPetalCount = parseInt(body.dataset.petalCount) || 8;
  // petal color
  currentPetalColor = body.dataset.petalColor || '#ff69b4';
  // center color
  currentCenterColor = body.dataset.centerColor || '#ffff00';
  // petal shape
  currentShape = body.dataset.shape || 'round';

  // create canvas
  let canvas = createCanvas(400, 400);
  canvas.parent('sketch-holder');
  background(255);
  drawFlower(width / 2, height / 2);
}

// function to draw flowers
function drawFlower(x, y) {
  background(255);
  push();
  translate(x, y);

  fill(currentPetalColor);
  noStroke();
  // draw each petal around the center, rotating each one evenly
  for (let i = 0; i < currentPetalCount; i++) {
    rotate(TWO_PI / currentPetalCount);
    // draw shape based on selected petal style
    if (currentShape === 'square') {
      rect(30, 0, 40, 40);
    } else if (currentShape === 'sharp') {
      triangle(30, -20, 70, 0, 30, 20);
    } else {
      ellipse(50, 0, 60, 40);
    }
  }
  // draw the center of the flower
  fill(currentCenterColor);
  noStroke();
  ellipse(0, 0, 50, 50);

  pop();
}

// store current flower settings
function saveFlowerSettings() {
  document.getElementById('petalCount').value = currentPetalCount;
  document.getElementById('petalColor').value = currentPetalColor;
  document.getElementById('centerColor').value = currentCenterColor;
  document.getElementById('shape').value = currentShape;
}

// wait until the HTML document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('saveForm').addEventListener('submit', (e) => {
    saveFlowerSettings();
  });

  // update the petal count when the slider changes
  document.getElementById('petalSlider').addEventListener('input', (e) => {
    currentPetalCount = parseInt(e.target.value);
    document.getElementById('petalCountDisplay').innerText = currentPetalCount;
    redrawFlower();
  });
  // update the petal color in real time when the color picker changes
  document.getElementById('petalColorPicker').addEventListener('input', (e) => {
    currentPetalColor = e.target.value;
    redrawFlower();
  });
  // update the center color when the color picker changes
  document.getElementById('centerColorPicker').addEventListener('input', (e) => {
    currentCenterColor = e.target.value;
    redrawFlower();
  });
  // update the petal shape
  document.getElementById('shapeSelector').addEventListener('change', (e) => {
    currentShape = e.target.value;
    redrawFlower();
  });
});

// clear and redraw the flower with updated settings
function redrawFlower() {
  clear();
  drawFlower(width / 2, height / 2);
}