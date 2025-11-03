//B"H
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startMenu = document.getElementById('startMenu');
const gameOverMenu = document.getElementById('gameOverMenu');
const playButton = document.getElementById('playButton');
const replayButton = document.getElementById('replayButton');
const powerupExplanation = document.getElementById('powerupExplanation');

// Game variables
let doveY, velocity, score, pipes, powerups, gameOver, gameStarted;
const gravity = 0.25; // Reduced gravity for a gentler fall
const lift = -6;    // Adjusted lift to match the new gravity
const doveX = 100;
let frameCount = 0;

// Pipe variables
const pipeWidth = 50;
const pipeGap = 200;
let pipeSpeed = 2;

// Power-up variables
const powerupSize = 30;
let activePowerup = null;
let powerupTimer = 0;

// Load dove emoji as an image
const dove = new Image();
dove.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🕊️</text></svg>';

function initializeGame() {
    doveY = canvas.height / 2;
    velocity = 0;
    score = 0;
    pipes = [];
    powerups = [];
    gameOver = false;
    gameStarted = false;
    activePowerup = null;
    powerupTimer = 0;
    frameCount = 0;
    pipes.push({ x: canvas.width + 50, y: Math.random() * (canvas.height - pipeGap - 100) + 50 });
}

function spawnPipe() {
    const pipeY = Math.random() * (canvas.height - pipeGap - 100) + 50;
    pipes.push({ x: canvas.width, y: pipeY });
}

function spawnPowerup() {
    const powerupTypes = [
        { letter: 'ח', explanation: 'Chesed (loving-kindness) grants you a protective shield.' },
        { letter: 'ג', explanation: 'Gevurah (strength) gives you a burst of speed.' },
        { letter: 'ת', explanation: 'Teshuvah (return) clears the path ahead.' }
    ];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    powerups.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 200) + 100,
        ...type
    });
}

function drawDove() {
    // --- NEW: Dove Rotation Logic ---
    // Calculate rotation based on velocity for a dynamic feel
    const maxRotation = Math.PI / 4; // Max downward tilt (45 degrees)
    const minRotation = -Math.PI / 6; // Max upward tilt (30 degrees)
    let rotation = velocity * 0.05; // Scale velocity to a reasonable rotation value

    // Clamp the rotation so the dove doesn't spin wildly
    if (rotation > maxRotation) {
        rotation = maxRotation;
    }
    if (rotation < minRotation) {
        rotation = minRotation;
    }

    ctx.save();
    ctx.translate(doveX, doveY);
    ctx.rotate(rotation); // Apply the calculated rotation
    // Draw the image centered on the new rotated origin
    ctx.drawImage(dove, -25, -25, 50, 50);
    ctx.restore();
}


function drawPipes() {
    ctx.fillStyle = '#333'; // Represents Tohu and Vohu (chaos)
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.y);
        ctx.fillRect(pipe.x, pipe.y + pipeGap, pipeWidth, canvas.height - pipe.y - pipeGap);
    });
}

function drawPowerups() {
    ctx.font = '30px Arial';
    ctx.fillStyle = '#FFD700';
    powerups.forEach(powerup => {
        ctx.fillText(powerup.letter, powerup.x, powerup.y);
    });
}

function update() {
    if (gameOver) return;

    // Dove physics
    velocity += gravity;
    doveY += velocity;

    // Prevent dove from going off-screen at the top
    if (doveY < 25) {
        doveY = 25;
        velocity = 0;
    }

    // Collision with bottom
    if (doveY > canvas.height - 25) {
        endGame();
    }

    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    if (pipes[0] && pipes[0].x < doveX - pipeWidth - 25) {
        pipes.shift();
        score++;
    }

    if (frameCount % 150 === 0) {
        spawnPipe();
    }
    if (frameCount % 300 === 0) {
        spawnPowerup();
    }

    // Update powerups
    powerups.forEach(powerup => {
        powerup.x -= pipeSpeed;
    });

    // Collision detection with pipes
    pipes.forEach(pipe => {
        if (
            doveX + 25 > pipe.x && doveX - 25 < pipe.x + pipeWidth &&
            (doveY - 25 < pipe.y || doveY + 25 > pipe.y + pipeGap) &&
            activePowerup !== 'ח'
        ) {
            endGame();
        }
    });

    // Collision detection with powerups
    powerups.forEach((powerup, index) => {
        if (
            doveX + 25 > powerup.x && doveX - 25 < powerup.x + 30 &&
            doveY + 25 > powerup.y - 30 && doveY - 25 < powerup.y
        ) {
            activatePowerup(powerup);
            powerups.splice(index, 1);
        }
    });

    frameCount++;

    // Handle active powerup
    if (activePowerup) {
        powerupTimer--;
        if (powerupTimer <= 0) {
            deactivatePowerup();
        }
    }
}

function activatePowerup(powerup) {
    activePowerup = powerup.letter;
    powerupExplanation.innerText = powerup.explanation;
    powerupExplanation.style.display = 'block';
    setTimeout(() => powerupExplanation.style.display = 'none', 3000);

    switch (activePowerup) {
        case 'ג':
            pipeSpeed = 4;
            break;
        case 'ת':
            if (pipes.length > 0) {
                pipes.shift();
            }
            break;
    }
    powerupTimer = 300; // Powerup lasts for 5 seconds (60fps * 5)
}

function deactivatePowerup() {
    if (activePowerup === 'ג') {
        pipeSpeed = 2;
    }
    activePowerup = null;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPipes();
    drawPowerups();
    drawDove(); // Draw dove last so it's on top

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '30px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw shield for Chesed powerup
    if (activePowerup === 'ח') {
        ctx.beginPath();
        ctx.arc(doveX, doveY, 35, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.lineWidth = 5;
        ctx.stroke();
    }
}

function gameLoop() {
    if (gameStarted) {
        update();
    }
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    startMenu.style.display = 'none';
    gameOverMenu.style.display = 'none';
    initializeGame();
    gameStarted = true;
    gameLoop();
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    gameOverMenu.style.display = 'flex';
}

playButton.addEventListener('click', startGame);
replayButton.addEventListener('click', startGame);

// --- CONTROLS ---
function flap() {
    if (gameStarted && !gameOver) {
        velocity = lift;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        flap();
    }
});
canvas.addEventListener('click', flap);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents screen from scrolling and double-taps zooming
    flap();
});

// Initialize on first load
initializeGame();
draw(); // Draw initial state before game starts