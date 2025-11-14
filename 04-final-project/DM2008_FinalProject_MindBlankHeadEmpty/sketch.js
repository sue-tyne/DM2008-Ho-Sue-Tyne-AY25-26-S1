let angle = 0;
let detail = 50;
let noiseScale = 2;

// movement parameters
let sphereRadius = 208;
let circleAngle = 0; // current position along circumference
let moveSpeed = 0.02; // base speed around sphere
let direction = 1; // 1 = clockwise, -1 = counterclockwise

// color + model
let colorSlider;
let goldfish;

// fish animation parameters
let tailAngle = 0;
let tailSpeed = 0.3;
let tailAmplitude = 0.3;
let tailOffsetZ = 70; // adjust based on goldfish.obj proportions

let bubbles = [];
let numBubbles = 20; // adjust for density

// slow motion variables
let slowMotion = false;
let slowFactor = 0.2; // how much slower everything gets

// for text
let hud;

let bgColor = 0;

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

  hud = new HUD(); 
}

function draw() {
  background(bgColor);
  orbitControl();


  // lighting
  directionalLight(255, 255, 255, 0.5, 1, 5);
  ambientLight(150);

  // --- slow motion multiplier ---
  let speedMultiplier = slowMotion ? slowFactor : 1;

  // derive current speeds
  let currentMoveSpeed = moveSpeed * speedMultiplier;
  let currentTailSpeed = tailSpeed * speedMultiplier;
  let currentAngleSpeed = 0.05 * speedMultiplier;

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

  // --- goldfish movement around circumference ---
  circleAngle -= currentMoveSpeed * direction;

  // compute fish position (swimming around equator in XZ plane)
  let x = sphereRadius * cos(circleAngle);
  let y = 0;
  let z = sphereRadius * sin(circleAngle);

  // when completing a full circle, flip direction
  if (circleAngle > TWO_PI || circleAngle < -TWO_PI) {
    circleAngle = 0;
  }

  // tail animation
  tailAngle = sin(frameCount * currentTailSpeed) * tailAmplitude;

  // --- draw goldfish ---
  push();
  translate(x, y, z);

  colorMode(RGB, 255);

  // face direction of travel (tangent to the circle)
  rotateY(circleAngle - HALF_PI / direction);
  rotateX(PI - 10); // tilt upward slightly
  scale(0.6, -0.6, 0.6);

  // lighting for the fish
  pointLight(180, 100, 120, 10, 0, 10);

  // material
  ambientMaterial(255, 165, 10);
  specularMaterial(255, 210, 100);

  // tail movement
  push();
  translate(0, 0, tailOffsetZ);
  rotateY(tailAngle);
  translate(0, 0, -tailOffsetZ);
  model(goldfish);
  pop();

  pop();

  // slowly rotate background sphere
  angle += currentAngleSpeed;

  // --- draw bubbles ---
  for (let b of bubbles) {
    b.update(speedMultiplier);
    b.display();
  }
hud.draw();

}

// --- Bubble class ---
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

  update(speedMultiplier = 1) {
    this.y -= this.speed * speedMultiplier; // rise
    this.wobblePhase += this.wobbleSpeed * speedMultiplier;
    this.x += sin(this.wobblePhase) * 0.2;
    this.z += cos(this.wobblePhase) * 0.1;

    if (this.y < -height / 2 - 100) {
      this.reset();
    }
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    colorMode(RGB, 255);
    ambientMaterial(180, 220, 255);
    specularMaterial(255);
    shininess(50);
    sphere(this.size, 12, 12);
    pop();
  }
}

class HUD {
  constructor() {
    this.layer = createGraphics(windowWidth, windowHeight); // 2D canvas
    this.layer.textSize(18);
    this.layer.fill('orange');
    this.layer.stroke(5);
    this.layer.textAlign(LEFT, TOP);
  }

  draw() {
    // clear previous frame
    this.layer.clear();

    // draw text in normal screen coordinates
    this.layer.text("press ← →", 20, 20);
    this.layer.text("press ↑ ↓", 20, 50);
    this.layer.text("hold SPACE", 20, 80);
    this.layer.text("warning: bright lights", 20, 110);

    const bottomText = "WELCOME TO MIND BLANK:HEAD EMPTY";

    // reuse the same text size already set in constructor
    const tw = this.layer.textWidth(bottomText);
    const th = this.layer.textSize();   // same font height/size as top-left text

    // Uses same padding and same layer dimensions
    const padding = 20;

    this.layer.text(
      bottomText,
      this.layer.width - tw - padding,   // right side
      this.layer.height - th - padding   // bottom side
    );

    // draw this 2D layer on top of the WEBGL canvas
    image(this.layer, -width / 2, -height / 2);
  }
}

// --- keyboard controls ---
function keyPressed() {
  slowMotion = true;
  bgColor = color(75, 165, 105); // light blue

  // control goldfish direction and speed
  if (keyCode === LEFT_ARROW) {
    direction = -1; // counterclockwise
  } else if (keyCode === RIGHT_ARROW) {
    direction = 1; // clockwise
  } else if (keyCode === UP_ARROW) {
    sphereRadius = max(100, sphereRadius - 20); // move closer to center
  } else if (keyCode === DOWN_ARROW) {
    sphereRadius = min(400, sphereRadius + 20); // move farther from center
  }
}

function keyReleased() {
  slowMotion = false;
  bgColor = color(0); // black
}







