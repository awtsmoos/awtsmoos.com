//B"H
import * as C from './constants.js';
import * as Dove from './dove.js';
import * as Obstacle from './obstacle.js';
import * as Controls from './controls.js';
import * as Background from './background.js';

//B"H
// (Keep all your import statements above this)

// --- NEW HELPER FUNCTION: Convert Number to Gematria ---
function toGematria(num) {
    if (num <= 0) return ' '; // Return a space or empty string for zero
    
    // Handle special cases to avoid sacred names
    if (num === 15) return 'ט"ו';
    if (num === 16) return 'ט"ז';

    const letters = [
        { val: 400, char: 'ת' }, { val: 300, char: 'ש' }, { val: 200, char: 'ר' },
        { val: 100, char: 'ק' }, { val: 90, char: 'צ' }, { val: 80, char: 'פ' },
        { val: 70, char: 'ע' }, { val: 60, char: 'ס' }, { val: 50, char: 'נ' },
        { val: 40, char: 'מ' }, { val: 30, char: 'ל' }, { val: 20, char: 'כ' },
        { val: 10, char: 'י' }, { val: 9, char: 'ט' }, { val: 8, char: 'ח' },
        { val: 7, char: 'ז' }, { val: 6, char: 'ו' }, { val: 5, char: 'ה' },
        { val: 4, char: 'ד' }, { val: 3, char: 'ג' }, { val: 2, char: 'ב' },
        { val: 1, char: 'א' }
    ];

    let result = '';
    let n = num;

    for (const letter of letters) {
        while (n >= letter.val) {
            result += letter.char;
            n -= letter.val;
        }
    }

    // Add Geresh (') for single letters or Gershayim (") for multiple
    if (result.length > 1) {
        result = result.slice(0, -1) + '"' + result.slice(-1);
    } else if (result.length === 1) {
        result += "'";
    }

    return result;
}



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
    Background.draw(ctx);
    Obstacle.draw(ctx);
    Dove.draw(ctx);

    //B"H
    //B"H
    // --- Draw Score and its Gematria ---
    ctx.textAlign = 'center';

    const scoreX = C.CANAS_WIDTH / 2;
    const scoreY = 50;
    
    // -- Score Number --
    ctx.font = 'bold 40px Arial';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    
    ctx.strokeText(score, scoreX, scoreY); // Black outline
    ctx.fillStyle = '#fff';
    ctx.fillText(score, scoreX, scoreY);   // White fill

    // -- Calculated Gematria Subtitle --
    const gematriaText = toGematria(score); // Calculate the Gematria!
    const gematriaY = scoreY + 30;
    ctx.font = 'bold 20px Arial';

    ctx.strokeText(gematriaText, scoreX, gematriaY); // Black outline
    ctx.fillStyle = '#fff';
    ctx.fillText(gematriaText, scoreX, gematriaY);   // White fill
    
    // --- End of Score Drawing ---

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