//B"H
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
let player, obstacles, collectibles, score, gameSpeed, scoreText, isGameOver;

// --- Game Setup ---
function setCanvasSize() {
    const aspectRatio = 2 / 1; // Width is twice the height
    const containerWidth = document.getElementById('gameContainer').offsetWidth;
    let canvasWidth = containerWidth;
    let canvasHeight = canvasWidth / aspectRatio;

    if (canvasHeight > window.innerHeight * 0.6) {
        canvasHeight = window.innerHeight * 0.6;
        canvasWidth = canvasHeight * aspectRatio;
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

function init() {
    isGameOver = false;
    setCanvasSize();
    const groundPosition = canvas.height - 50;
    player = new Player(80, groundPosition, 25);
    obstacles = [];
    collectibles = [];
    score = 0;
    gameSpeed = 5;

    scoreText = {
        x: canvas.width - 20,
        y: 40,
        draw: function() {
            ctx.font = '30px Arial';
            ctx.fillStyle = '#003366';
            ctx.textAlign = 'right';
            ctx.fillText(`Mitzvos: ${score}`, this.x, this.y);
        }
    };
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    animate();
}

// --- Game Loop ---
let frameCount = 0;
function animate() {
    if (isGameOver) return;
    
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw Ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 25);
    ctx.lineTo(canvas.width, canvas.height - 25);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    player.update();
    scoreText.draw();

    frameCount++;
    // Add new obstacles and collectibles periodically
    if (frameCount % 100 === 0) {
        const itemType = Math.random();
        if (itemType > 0.4) { // More likely to be an obstacle
            const size = 50;
            const y = canvas.height - 50;
            obstacles.push(new Obstacle(canvas.width, y, size, gameSpeed));
        } else { // Less likely to be a collectible
            const size = 40;
            const y = (Math.random() < 0.5) ? canvas.height - 120 : canvas.height - 50; // Jumps or ground
            collectibles.push(new Collectible(canvas.width, y, size, gameSpeed));
        }
    }
    
    // Update Obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        if (detectCollision(player, obstacle)) {
            endGame();
        }
        if (obstacle.x < -obstacle.size) {
            obstacles.splice(index, 1);
        }
    });

    // Update Collectibles
    collectibles.forEach((collectible, index) => {
        collectible.update();
        if (detectCollision(player, collectible)) {
            score++;
            gameSpeed += 0.1; // Speed up slightly with each mitzvah
            collectibles.splice(index, 1);
        }
        if (collectible.x < -collectible.size) {
            collectibles.splice(index, 1);
        }
    });
}

function detectCollision(player, item) {
    const distX = Math.abs(player.x - item.x);
    const distY = Math.abs(player.y - item.y);
    const itemRadius = item.size / 2;
    
    return distX < player.radius + itemRadius && distY < player.radius + itemRadius;
}

function endGame() {
    isGameOver = true;
    gameOverScreen.style.display = 'block';
}

// --- Event Listeners ---
function handleStart() {
    if (isGameOver || !player) {
        init();
    }
    player.jump();
}

window.addEventListener('resize', () => {
    if (!isGameOver) {
       setCanvasSize();
       // Re-initialize to adjust positions based on new size
       init();
    }
});

// Controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleStart();
    }
});

window.addEventListener('touchstart', handleStart);

// Initial canvas setup
setCanvasSize();