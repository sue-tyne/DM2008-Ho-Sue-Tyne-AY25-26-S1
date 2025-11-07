let angle = 0;
let detail = 60;
let noiseScale = 3;

// circle movement parameters
let sphereRadius = 208; // how far from the center the circle floats
let circleTheta; // horizontal angle (around Y)
let circlePhi; // vertical angle (from top)
let moveSpeed = 0.1; // how fast it moves along the curve

let fishONE, fishTWO, fishTHREE;
let fishFrame; 
let fishFrameIndex = 0; // current frame of fish
let fishFrameSpeed = 4; // how many draw frames per fish frame change

function preload() {
  fishONE = loadImage("fish1.png");
  fishTWO = loadImage("fish2.png");
  fishTHREE = loadImage("fish3.png");
}

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();

  // initialize spherical angles safely using p5's constant
  circleTheta = PI/2.3; 
  circlePhi = PI/2.5;
  
  fishFrames = [fishONE, fishTWO, fishTHREE];
}

function draw() {
  background(30);

  // --- rotating sphere ---
  push();
  rotateY(angle * 0.6);
  rotateZ(angle * 0.4);

  directionalLight(255, 255, 255, 0.5, 1, 5);
  ambientLight(150);

  let baseRadius = 180;
  let blue = color(0, 120, 255);
  let black = color(0, 0, 0);

  for (let i = 0; i < detail; i++) {
    let lat0 = map(i, 0, detail, -HALF_PI, HALF_PI);
    let lat1 = map(i + 1, 0, detail, -HALF_PI, HALF_PI);

    beginShape(TRIANGLE_STRIP);
    for (let j = 0; j <= detail; j++) {
      let lon = map(j, 0, detail, -PI, PI);

      let x0 = cos(lat0) * cos(lon);
      let y0 = sin(lat0);
      let z0 = cos(lat0) * sin(lon);
      let n0 = noise(x0 * noiseScale + 10, y0 * noiseScale + 10, z0 * noiseScale + angle * 0.2);
      let radius0 = baseRadius + n0 * 40;
      fill(lerpColor(black, blue, n0));
      vertex(x0 * radius0, y0 * radius0, z0 * radius0);

      let x1 = cos(lat1) * cos(lon);
      let y1 = sin(lat1);
      let z1 = cos(lat1) * sin(lon);
      let n1 = noise(x1 * noiseScale + 10, y1 * noiseScale + 10, z1 * noiseScale + angle * 0.2);
      let radius1 = baseRadius + n1 * 40;
      fill(lerpColor(black, blue, n1));
      vertex(x1 * radius1, y1 * radius1, z1 * radius1);
    }
    endShape();
  }
  pop();

  // --- floating circle ---
  let x = sphereRadius * sin(circlePhi) * cos(circleTheta);
  let y = -sphereRadius * cos(circlePhi);
  let z = sphereRadius * sin(circlePhi) * sin(circleTheta);

  if (frameCount % fishFrameSpeed === 0) {
    fishFrameIndex = (fishFrameIndex + 1) % fishFrames.length;
  } 
  
  push();
  translate(x, y, z);
  // emissiveMaterial(255, 180, 100);
  texture(fishFrames[fishFrameIndex]);
  tint(255, 200);
  plane(80);
  pop();

  angle += 0.05;
}

function keyPressed() {
  let diagonalSpeed = 0.15; // controls how much theta and phi change per key press

  if (keyCode === LEFT_ARROW) {
    circleTheta += diagonalSpeed; // rotate left
    circlePhi -= diagonalSpeed;   // move slightly down along sphere
  } 
  else if (keyCode === RIGHT_ARROW) {
    circleTheta -= diagonalSpeed; // rotate right
    circlePhi += diagonalSpeed;   // move slightly down along sphere
  }
  else if (keyCode === UP_ARROW) {
    circleTheta -= diagonalSpeed+0.1
    circlePhi -= diagonalSpeed+0.03;
  }
  else if (keyCode === DOWN_ARROW) {
    circleTheta += diagonalSpeed+0.05;
    circlePhi += diagonalSpeed+0.1;
  }

  circlePhi = constrain(circlePhi, 0.1, PI/2); // so it stays at the top right of the sphere
}

