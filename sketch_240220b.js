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

var gameActive = false; // Added variable to track the game state

var shakeIntensity = 10;
var shakeDuration = 200; // milliseconds
var shakeEndTime = 0;

var gameSpeed = 5;

var increaseSpeedScoreThreshold = 500; // Increase speed for every 100 points scored
var lastSpeedIncreaseScore = 0; // Track the score at the last speed increase

// Define game states
const GameState = {
  TITLE: 'title',
  PLAYING: 'playing',
};

// Set the initial state
let currentState = GameState.TITLE;

function setup() {
  createCanvas(400, canvasHeight);
}

function draw() {
  background(220);
if (currentState === GameState.TITLE) {
    // Display title screen
    drawTitleScreen();
  } else if (currentState === GameState.PLAYING) {
    if (gameActive) {
     textSize(12); 
     textAlign(LEFT, BASELINE);
      if (balls.length === 0 && score - lastSpeedIncreaseScore >= increaseSpeedScoreThreshold) {
        gameSpeed += 1; // Increase the game speed
        lastSpeedIncreaseScore = score; // Update last speed increase score
      }
      
      // Create a new ball with a certain probability and minimum distance
      if (random() < 0.04) {
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

function drawTitleScreen() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(0);
  text('Ball Drop', width / 2, height / 2 - 20);
  textSize(20);
  text('Play', width / 2, height / 2 + 20);
}

function endGame() {
  gameActive = false;
}

function keyPressed() {
  if (key === ' ' && gameActive) {
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

function mousePressed() {
  if (gameActive) { // Ensure the game is active
    var d = dist(mouseX, mouseY, targetX, targetY);
    if (d < targetSize / 2) { // Check if the click is within the target
      // Similar to the previous keyPressed function, iterate through balls
      var hitDetected = false;
      for (var i = 0; i < balls.length; i++) {
        var ballDistance = dist(balls[i].x, balls[i].y, targetX, targetY);
        var combinedRadius = balls[i].diameter / 2 + targetSize / 2;

        if (ballDistance < combinedRadius) {
          // Ball hit detected
          score += 25; // Adjust score accordingly
          flashEndTime = millis() + flashDuration; // Trigger flash effect
          balls.splice(i, 1); // Remove the ball
          hitDetected = true;
          break; // Exit loop after a hit
        }
      }

      // Penalize if no hit is detected
      if (!hitDetected) {
        lifeMeter += 5; // Assuming you want to decrease life for a miss
        // You might want to trigger the screen shake here as well
        shakeEndTime = millis() + shakeDuration;
      }
    }
  } else {
    if (currentState === GameState.TITLE) {
      // Check if the click is within the "Play" text bounds
      // This is a simple way; for better UX, consider checking x and y coordinates
      let playTextWidth = textWidth('Play');
      let playTextX = (width - playTextWidth) / 2;
      let playTextY = height / 2 + 20;
      
      if (mouseX >= playTextX && mouseX <= playTextX + playTextWidth &&
          mouseY >= playTextY - 10 && mouseY <= playTextY + 10) { // Adjust bounds as needed
        currentState = GameState.PLAYING;
        gameActive = true;
      }
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
