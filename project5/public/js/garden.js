// array to store all flower objects
let flowerObjects = [];
// flag to temporarily disable flower hover tooltip
let suppressFlowerTooltip = false;
let page = 0;
// maximum flowers per page
const flowersPerPage = 15;

function setup() {
  // create canvas
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-holder');
  // initialize the flower grid
  initializeFlowers();
  // bind mouse movement events for tooltip interactions
  canvas.mouseMoved(showTooltip);
  canvas.mouseOut(hideTooltip);
  // Start the draw loop
  loop();
}

function draw() {
  // clear the previous frame
  clear();
  background(0, 0, 0, 0);
  // display all flower objects
  for (let f of flowerObjects) {
    f.display();
  }
  // display tooltips
  showTooltip();
  // show/hide the pagination arrows
  updateArrowVisibility();
}

function mousePressed() {
  // if the user clicks on a flower, navigate to its detail page
  for (let f of flowerObjects) {
    if (dist(mouseX, mouseY, f.x, f.y) < 50) {
      // redirect to flower's view page
      window.location.href = `/view?id=${f.data._id}`;
      break;
    }
  }
}

// flower class representing each flower instance
class Flower {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;
    this.data = data;
  }
  // determine if mouse is hovering over this flower
  isHovered(mx, my) {
    return dist(mx, my, this.x, this.y) < 50;
  }
  // render the flower
  display() {
    push();
    translate(this.x, this.y);
    // if hovered, draw flower slightly larger
    let hovered = this.isHovered(mouseX, mouseY);
    scale(hovered ? 0.9 : 0.8);
    // Draw petals
    noStroke();
    fill(this.data.petalColor || '#ff69b4');

    let petalCount = this.data.petalCount || 8;
    for (let i = 0; i < petalCount; i++) {
      rotate(TWO_PI / petalCount);
      if (this.data.shape === 'square') {
        rect(30, 0, 40, 40);
      } else if (this.data.shape === 'sharp') {
        triangle(30, -20, 70, 0, 30, 20);
      } else {
        ellipse(50, 0, 60, 40);
      }
    }

    // Draw flower center
    fill(this.data.centerColor || '#ffff00');
    noStroke();
    ellipse(0, 0, 50, 50);
    pop();  // restore previous transformation state
  }
}

// create flower objects for the current page
function initializeFlowers() {
  flowerObjects = [];
  const cols = 5;
  const rows = 3;
  const marginX = width / (cols + 1);
  const marginY = height / (rows + 1);
  // determine which flowers to display based on current page
  let start = page * flowersPerPage;
  let end = Math.min(start + flowersPerPage, flowers.length);

  let i = start;
  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      if (i >= end) return;
      // calculate each flower’s x and y position in the grid
      let x = col * marginX;
      let y = row * marginY;
      // create a new Flower object and add it to the array
      let f = new Flower(x, y, flowers[i]);
      flowerObjects.push(f);
      i++;
    }
  }
}

// show tooltip with flower title if mouse is hovering over a flower
function showTooltip() {
  if (suppressFlowerTooltip) return;
  let hoveredFlower = null;
  for (let f of flowerObjects) {
    if (f.isHovered(mouseX, mouseY)) {
      hoveredFlower = f;
      break;
    }
  }
  const tooltip = document.getElementById('tooltip');
  if (hoveredFlower) {
    tooltip.innerText = hoveredFlower.data.title || 'Untitled';
    tooltip.style.left = mouseX + 15 + 'px';
    tooltip.style.top = mouseY + 'px';
    tooltip.style.display = 'block';
  } else {
    tooltip.style.display = 'none';
  }
}

// hide flower tooltip
function hideTooltip() {
  suppressFlowerTooltip = false;
  const tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
}

// show tooltip for the "plant new flower" button
function showPlantTooltip(e) {
  suppressFlowerTooltip = true;
  const tooltip = document.getElementById('tooltip');
  tooltip.innerText = 'Plant a new flower';
  tooltip.style.left = e.clientX + 15 + 'px';
  tooltip.style.top = e.clientY + 'px';
  tooltip.style.display = 'block';
}

// go to next page of flowers if there are more
function nextPage() {
  if ((page + 1) * flowersPerPage < flowers.length) {
    page++;
    initializeFlowers();
    draw(); // refresh screen
  }
}

// go to previous page if not on the first page
function prevPage() {
  if (page > 0) {
    page--;
    initializeFlowers();
    draw(); // refresh
  }
}

// show/hide left and right arrow buttons based on current page
function updateArrowVisibility() {
  const prevArrow = document.getElementById('prev-arrow');
  const nextArrow = document.getElementById('next-arrow');
  if (!prevArrow || !nextArrow) return;
  // hide left arrow on first page
  prevArrow.style.display = (page === 0) ? 'none' : 'block';
  // hide right arrow if there are no more flowers
  nextArrow.style.display = ((page + 1) * flowersPerPage >= flowers.length) ? 'none' : 'block';
}
