function setup() {
    // create canvas
    let canvas = createCanvas(windowWidth / 2, windowHeight);
    canvas.parent('sketch-holder');
    // clear bg
    clear();
    // draw the flower
    drawFlower();
  }
  
  function drawFlower() {
    // get DOM element
    const el = document.getElementById('flower-data');
    // get flower's color
    const petalColor = el.dataset.petalColor;
    // get center's color
    const centerColor = el.dataset.centerColor;
    // get number of petals
    const petalCount = parseInt(el.dataset.petalCount);
    // get petal's shape
    const shape = el.dataset.shape;

    push();
    // move origin to the center
    translate(width / 2, height / 2);
    // scale up flower for good look
    // maybe too big? adjust later
    scale(2.0);
    noStroke();
    fill(petalColor);
    
    // draw each petal
    for (let i = 0; i < petalCount; i++) {
      rotate(TWO_PI / petalCount);
      if (shape === 'square') {
        rect(30, 0, 40, 40);
      } else if (shape === 'sharp') {
        triangle(30, -20, 70, 0, 30, 20);
      } else {
        ellipse(50, 0, 60, 40);
      }
    }
  
    // draw the center
    fill(centerColor);
    noStroke();
    ellipse(0, 0, 50, 50);
    pop();
  }
  