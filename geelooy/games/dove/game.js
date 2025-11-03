//B"H
import * as C from './constants.js';
import * as Dove from './dove.js';
import * as Obstacle from './obstacle.js';
import * as Controls from './controls.js';
import * as Background from './background.js';

// Get DOM elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('startMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const playButton = document.getElementById('playButton');
const replayButton = document.getElementById('replayButton');

// Game State
let gameState = 'menu'; // 'menu', 'playing', 'over'
let frameCount = 0;
let score = 0;

function initializeGame() {
    gameState = 'playing';
    score = 0;
    frameCount = 0;
    Dove.reset();
    Background.init();
    Obstacle.reset();
    startMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    gameLoop();
}

function endGame() {
    gameState = 'over';
    gameOverMenu.style.display = 'flex';
}

function checkCollisions() {
    // Ground collision
    if (Dove.y > C.CANVAS_HEIGHT - C.DOVE_HEIGHT / 2) {
        return true;
    }

    // Obstacle collision
    for (const obs of Obstacle.obstacles) {
        if (
            C.DOVE_START_X + C.DOVE_WIDTH / 2 > obs.x &&
            C.DOVE_START_X - C.DOVE_WIDTH / 2 < obs.x + C.OBSTACLE_WIDTH
        ) {
            if (
                Dove.y - C.DOVE_HEIGHT / 2 < obs.topHeight ||
                Dove.y + C.DOVE_HEIGHT / 2 > obs.bottomY
            ) {
                return true;
            }
        }
    }
    return false;
}

function updateScore() {
    Obstacle.obstacles.forEach(obs => {
        if (!obs.passed && obs.x + C.OBSTACLE_WIDTH > C.DOVE_START_X) {
            obs.passed = true;
            score++;
        }
    });
}

function gameLoop() {
    if (gameState !== 'playing') return;

    // Update game objects
    Background.update();
    Dove.update();
    Obstacle.update();
    
    // Spawn new obstacles
    if (frameCount % C.OBSTACLE_SPAWN_RATE === 0) {
        Obstacle.spawn();
    }
    
    // Check for game over
    if (checkCollisions()) {
        endGame();
        return;
    }
    
    updateScore();

    // Draw everything
    ctx.clearRect(0, 0, C.CANVAS_WIDTH, C.CANVAS_HEIGHT);
    Obstacle.draw(ctx);
    Dove.draw(ctx);

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '40px Arial';
    ctx.fillText(score, C.CANVAS_WIDTH / 2, 50);

    frameCount++;
    requestAnimationFrame(gameLoop);
}

// Event Listeners
playButton.addEventListener('click', initializeGame);
replayButton.addEventListener('click', initializeGame);
Controls.init(() => {
    if (gameState === 'playing') {
        Dove.flap();
    }
}); 