canvasHeight = 600;

var bX = 200;
var bY = 0;
var score = 0;
var missedCount = 0;
var flashDuration = 100; // milliseconds (shortened for quicker flashing)
var flashEndTime = 0;

var balls = [];

var targetX = 200;
var targetY = 475;
var targetSize = 50;

var minBallDistance = 150; // Adjust this value based on your needs

var lifeMeter = -150;

var gameActive = true; // Added variable to track the game state

var shakeIntensity = 10;
var shakeDuration = 200; // milliseconds
var shakeEndTime = 0;

var gameSpeed = 7;

function setup() {
  createCanvas(400, canvasHeight);
}

function draw() {
  background(220);

  if (gameActive) {
    // Create a new ball with a certain probability and minimum distance
    if (random() < 0.03) {
      if (!balls.length || (millis() - balls[balls.length - 1].creationTime > minBallDistance)) {
        var newBall = new Ball(bX, 0, gameSpeed);
        balls.push(newBall);
        newBall.creationTime = millis();
      }
    }

    // Update and display each ball
    for (var i = balls.length - 1; i >= 0; i--) {
      balls[i].update();
      balls[i].display();

      // Remove the ball if it's out of the canvas and decrease the life meter
      if (balls[i].offScreen()) {
        missedCount += 1;
        balls.splice(i, 1);
        lifeMeter += 10; // Decrease the life meter when a ball is missed
      }
    }

    // Draw yellow circle behind the target
    if (millis() < flashEndTime) {
      var flashAlpha = map(millis(), flashEndTime - flashDuration, flashEndTime, 255, 0);
      noStroke(); // Remove outline
      fill(255, 255, 0, flashAlpha); // Yellow ring with varying transparency
      ellipse(targetX, targetY, targetSize + 20, targetSize + 20);
    }

    // Draw target
    stroke(0, 0, 0);
    fill(255, 0, 0);
    ellipse(targetX, targetY, targetSize, targetSize);

    // Draw title at the top
    //textAlign(CENTER, CENTER);
    //textSize(20);
    //fill(0);
    //text('I MADE THIS', width / 2, 20);
  
    // Draw score for game 
    //textSize(12);
    fill(0, 0, 0);
    text('Your Score', 300, 160);
    text(score, 300, 180);

    // Draw score for missed balls
    fill(0, 0, 0);
    text('Missed', 300, 210);
    text(missedCount, 300, 230);

     // Draw life meter with shake effect
    fill(0, 0, 0);
    text('Life', 300, 415);
    fill(255, 0, 0);
    var shakeOffsetX = 0;
    var shakeOffsetY = 0;

    if (millis() < shakeEndTime) {
      shakeOffsetX = random(-shakeIntensity, shakeIntensity);
      shakeOffsetY = random(-shakeIntensity, shakeIntensity);
    }

    rect(300 + shakeOffsetX, 400 + shakeOffsetY, 20, lifeMeter);
    // Check if life meter is zero
    if (lifeMeter >= 0) {
      endGame();
    }
  } else {
    drawGameOver();
  }
}

function drawGameOver() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text('Game Over', width / 2, height / 2);
  
  textSize(12);
  fill(0, 0, 0);
  text('Your Score', width / 2, (height / 2) + 30);
  text(score, width / 2, (height / 2) + 45);
}

function endGame() {
  gameActive = false;
}

function keyPressed() {
  if (key == 's' && gameActive) {
    // Check if there is a falling ball on the target
    var hitDetected = false;

    for (var i = 0; i < balls.length; i++) {
      var d = dist(balls[i].x, balls[i].y, targetX, targetY);
      var combinedRadius = balls[i].diameter / 2 + targetSize / 2;

      if (d < combinedRadius) {
        // Player hit the target
        score += 25;
        flashEndTime = millis() + flashDuration;
        balls.splice(i, 1);
        hitDetected = true;
        break; // exit the loop once a hit is detected
      }
    }

    // If no hit is detected, penalize the player by decreasing the life meter
    if (!hitDetected) {
      lifeMeter += 5;
      
      // Trigger screen shake effect
      shakeEndTime = millis() + shakeDuration;
    }
  }
}

// Ball class definition
function Ball(x, y, speed) {
  this.x = x;
  this.y = y;
  this.diameter = 50;
  this.speed = speed;
  this.creationTime = millis(); // Record the creation time of the ball

  this.update = function () {
    this.y += this.speed;
  };

  this.display = function () {
    stroke(0, 0, 0);
    fill(0, 0, 255);
    ellipse(this.x, this.y, this.diameter, this.diameter);
  };

  this.offScreen = function () {
    return this.y > canvasHeight + this.diameter / 2;
  };
}
