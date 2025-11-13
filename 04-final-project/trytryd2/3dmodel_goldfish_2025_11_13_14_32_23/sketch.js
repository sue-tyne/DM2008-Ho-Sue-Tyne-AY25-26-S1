let angle = 0;
let detail = 50;
let noiseScale = 2;

// sphere + fish motion parameters
let sphereRadius = 208;

// color + model
let colorSlider;
let goldfish;

// fish animation parameters
let tailAngle = 0;
let tailSpeed = 0.3;
let tailAmplitude = 0.3;
let tailOffsetZ = 70;

// fish movement control
let fishPos;
let fishDir = 1; // 1 = forward, -1 = backward
let swimProgress = 0;
let turning = false;
let turnAngle = 0;

// bubbles
let bubbles = [];
let numBubbles = 20;

function preload() {
  goldfish = loadModel("goldfish.obj", true);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  colorMode(HSB, 360, 100, 100);

  // slider for sphere hue
  colorSlider = createSlider(0, 200, 210, 1);
  colorSlider.position(width / 2 - 150, height - 100);
  colorSlider.style("width", "300px");

  for (let i = 0; i < numBubbles; i++) {
    bubbles.push(new Bubble());
  }

  fishPos = createVector();
}

function draw() {
  background(0);
  orbitControl();

  // lighting
  directionalLight(255, 255, 255, 0.5, 1, 5);
  ambientLight(150);

  // get sphere hue
  let hueValue = colorSlider.value();
  let baseRadius = 180;
  let mainColor = color(hueValue, 80, 100);
  let darkColor = color(hueValue, 100, 20);

  // --- rotating noise sphere ---
  push();
  rotateY(angle * 0.6);
  rotateZ(angle * 0.4);
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

  // --- FISH MOTION SECTION ---
  tailAngle = sin(frameCount * tailSpeed) * tailAmplitude;

  if (!turning) {
    // move diagonally across front
    swimProgress += 0.003 * fishDir;

    let diagRadius = sphereRadius * 1.3;
    fishPos.x = lerp(-diagRadius, diagRadius, swimProgress);
    fishPos.y = lerp(diagRadius * 0.4, -diagRadius * 0.4, swimProgress);
    fishPos.z = sin(swimProgress * PI) * 80;

    // begin turning at edges
    if (swimProgress >= 1 || swimProgress <= 0) {
      turning = true;
      turnAngle = 0;
    }
  } else {
    // turning animation behind sphere
    turnAngle += 3;
    if (turnAngle >= 360) {
      turning = false;
      fishDir *= -1;
      swimProgress = constrain(swimProgress, 0, 1);
    }
  }

  // --- DRAW FISH ---
  push();
  translate(fishPos.x, fishPos.y, fishPos.z);

  // rotation logic
  if (turning) rotateY(radians(turnAngle));
  if (fishDir === 1) rotateY(-PI / 4);
  else rotateY((PI * 3) / 4);

  rotateX(-PI / 2);
  scale(0.6, -0.6, 0.6);

  // lighting and material
  pointLight(180, 100, 120, 10, 0, 10);
  colorMode(RGB, 255);
  ambientMaterial(255, 165, 10);
  specularMaterial(255, 210, 100);

  push();
  translate(0, 0, tailOffsetZ);
  rotateY(tailAngle);
  translate(0, 0, -tailOffsetZ);
  model(goldfish);
  pop();

  pop();

  // --- BUBBLES ---
  for (let b of bubbles) {
    b.update();
    b.display();
  }

  angle += 0.05;
}

// ----------------------------
// Bubble class
class Bubble {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(-width / 2, width / 2);
    this.y = random(height / 2 + 100, height / 2 + 300);
    this.z = random(-300, 300);
    this.size = random(5, 50);
    this.speed = random(0.5, 3);
    this.wobblePhase = random(TWO_PI);
    this.wobbleSpeed = random(0.01, 0.1);
  }

  update() {
    this.y -= this.speed;
    this.wobblePhase += this.wobbleSpeed;
    this.x += sin(this.wobblePhase) * 0.2;
    this.z += cos(this.wobblePhase) * 0.1;

    if (this.y < -height / 2 - 100) this.reset();
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    colorMode(RGB, 255);
    ambientMaterial(180, 220, 255, 180); // slightly translucent
    specularMaterial(255);
    shininess(50);
    sphere(this.size, 12, 12);
    pop();
  }
}





