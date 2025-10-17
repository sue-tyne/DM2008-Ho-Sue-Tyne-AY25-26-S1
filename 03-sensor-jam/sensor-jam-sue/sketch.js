let port; // Serial Communication port
let connectBtn;

let sensorVal;
let circleSize = 50;
let targetSize = 50; // used for Option 2

let circles = [
  { x: 100, y: 400, dx: 8, size: 200 },
  { x: 300, y: 400, dx: 8, size: 200 },
  { x: 500, y: 400, dx: 8, size: 200 }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);
}

function draw() {
  background(0);
  stroke(255,0,0);
  strokeWeight(10);

  for (let c of circles) {
    c.x += c.dx;

  if (c.x < c.size / 2 || c.x > width - c.size / 2) {
      c.dx *= -1;
    }

    ellipse(c.x, c.y, circleSize);
  }
 // ellipse(width / 2, height / 2, circleSize);
 // ellipse(width / 2 + 200, height / 2, circleSize);
 // ellipse(width / 2 - 200, height / 2, circleSize);

  // Receive data from Arduino
  if (port.opened()) {
    sensorVal = port.readUntil("\n");
    // Only log data that has information, not empty signals
    if (sensorVal[0]) {
      // Once you verify data is coming in,
      // disable logging to improve performance
      console.log(sensorVal);

      // OPTION 1:
      // Update circle's size with sensor's data directly
      // Reduce delay() value in Ardiuno to get smoother changes

      // use float() to convert from data from string to number
      // circleSize = float(sensorVal);

      // OPTION 2:
      // Update circle's size using lerp() to smoothly change values
      // This method even works with longer delay() values in Arduino

      targetSize = float(sensorVal);
      // last value in lerp() controls speed of change
      circleSize = lerp(circleSize, targetSize, 0.1);
    }
  }
}

// DO NOT REMOVE THIS FUNCTION
function connectBtnClick(e) {
  // If port is not already open, open on click,
  // otherwise close the port
  if (!port.opened()) {
    port.open(9600); // opens port with Baud Rate of 9600
    e.target.innerHTML = "Disconnect Arduino";
    e.target.classList.add("connected");
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.classList.remove("connected");
  }
}
