let angle = 0;
let detail = 50;
let noiseScale = 2;

// circle movement parameters
let sphereRadius = 208;
let circleTheta;
let circlePhi;
let moveSpeed = 0.3;

let fishONE, fishTWO, fishTHREE;
let fishFrame; 
let fishFrameIndex = 0;
let fishFrameSpeed = 5;

let pulse;
let colorSlider; // NEW —xslider for sphere color

function preload() {
  fishONE = loadImage("fish1.png");
  fishTWO = loadImage("fish2.png");
  fishTHREE = loadImage("fish3.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  colorMode(HSB, 360, 100, 100); // allows hue control

  circleTheta = PI / 2.3;
  circlePhi = PI / 2.5;
  
  fishFrames = [fishONE, fishTWO, fishTHREE];
  
  // --- create color slider ---
  colorSlider = createSlider(0, 200, 210, 1); // hue range
  colorSlider.position(width/2, height/2 +150);
  colorSlider.style('width', '300px');
}

function draw() {
  background(0);
  orbitControl();

  let hueValue = colorSlider.value(); // get current slider hue
  
  push();
  rotateY(angle * 0.6);
  rotateZ(angle * 0.4);

  directionalLight(255, 255, 255, 0.5, 1, 5);
  ambientLight(150);

  let baseRadius = 180;
  let mainColor = color(hueValue, 80, 100);
  let darkColor = color(hueValue, 100, 20);
  

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
      fill(lerpColor(darkColor, mainColor, n0));
      vertex(x0 * radius0, y0 * radius0, z0 * radius0);

      let x1 = cos(lat1) * cos(lon);
      let y1 = sin(lat1);
      let z1 = cos(lat1) * sin(lon);
      let n1 = noise(x1 * noiseScale + 10, y1 * noiseScale + 10, z1 * noiseScale + angle * 0.2);
      let radius1 = baseRadius + n1 * 40;
      fill(lerpColor(darkColor, mainColor, n1));
      vertex(x1 * radius1, y1 * radius1, z1 * radius1);
    }
    endShape();
  }
  pop();
  

// --- floating fish sprite ---
let x = sphereRadius * sin(circlePhi) * cos(circleTheta);
let y = -sphereRadius * cos(circlePhi);
let z = sphereRadius * sin(circlePhi) * sin(circleTheta);

if (frameCount % fishFrameSpeed === 0) {
  fishFrameIndex = (fishFrameIndex + 1) % fishFrames.length;
}

push();
translate(x, y, z);
texture(fishFrames[fishFrameIndex]);
tint(100, 50); // <-- reduce opacity to ~150 (out of 255)
plane(80);
pop();


  angle += 0.05;
}

function keyPressed() {
  let diagonalSpeed = 0.15;

  if (keyCode === LEFT_ARROW) {
    circleTheta += diagonalSpeed;
    circlePhi -= diagonalSpeed;
  } 
  else if (keyCode === RIGHT_ARROW) {
    circleTheta -= diagonalSpeed;
    circlePhi += diagonalSpeed;
  }
  else if (keyCode === UP_ARROW) {
    circleTheta -= diagonalSpeed + 0.1;
    circlePhi -= diagonalSpeed + 0.03;
  }
  else if (keyCode === DOWN_ARROW) {
    circleTheta += diagonalSpeed + 0.05;
    circlePhi += diagonalSpeed + 0.1;
  }

  circlePhi = constrain(circlePhi, 0.1, PI / 2);
}


