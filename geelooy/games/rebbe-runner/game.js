//B"H



const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
let player, obstacles, collectibles, score, gameSpeed, isGameOver;
let groundPosition, scoreText;
let clouds = [], buildings = []; // Arrays for our background elements
let roadLines = [];

// --- Game Setup ---
function setCanvasSize() {
    // --- THIS IS THE FIX ---
    // Directly set the canvas dimensions to the true visible area of the window.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Adjust the ground position to be near the bottom of this new, correct height.
    // Let's give it 40 pixels of space for the ground and road lines.
    groundPosition = canvas.height - 40; 
}

function drawRoadLines() {
    ctx.fillStyle = '#FFD700'; // A gold/yellow color
    roadLines.forEach(line => {
        // Move the line to the left based on the game's speed
        line.x -= gameSpeed;
        ctx.fillRect(line.x, line.y, line.width, line.height);

        // If a line goes off-screen to the left, move it back to the right
        if (line.x + line.width < 0) {
            line.x = canvas.width + line.width;
        }
    });
}


function createBackground() {
    clouds = [];
    buildings = [];
    let cloudCount = 5;
    let buildingCount = 10;

    // Create majestic clouds
    for (let i = 0; i < cloudCount; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            size: Math.random() * 50 + 20,
            speed: Math.random() * 0.5 + 0.2 // Clouds move slowly
        });
    }

    // Create city buildings
    for (let i = 0; i < buildingCount; i++) {
        buildings.push({
            x: i * (canvas.width / (buildingCount - 3)), // Space them out
            width: Math.random() * 80 + 50,
            height: Math.random() * 150 + 50,
            speed: 1 // Buildings move faster than clouds for parallax
        });
    }
}

function init() {
    isGameOver = false;
    setCanvasSize();
    createBackground();
    
    roadLines = [];
    let numLines = 15;
    let lineSpacing = canvas.width / (numLines - 5);
    for (let i = 0; i < numLines; i++) {
        roadLines.push({
            x: i * lineSpacing,
            y: groundPosition + 25, // Position it on the road
            width: 20, // Width of each dash
            height: 5  // Thickness of each dash
        });
    }

    // --- FIX: Make the player smaller ---
    player = new Player(55, groundPosition, 20);
    obstacles = [];
    collectibles = [];
    score = 0;
    gameSpeed = 4; // Start at a reasonable pace

    scoreText = {
        x: 20,
        y: 50,
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

function drawBackground() {
    // Sky
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x - cloud.size * 0.8, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        if (cloud.x + cloud.size < 0) cloud.x = canvas.width + cloud.size;
    });

    // Buildings
    ctx.fillStyle = '#B0C4DE';
    buildings.forEach(b => {
        b.x -= b.speed;
        ctx.fillRect(b.x, groundPosition - b.height, b.width, b.height);
        if (b.x + b.width < 0) b.x = canvas.width + b.width;
    });

    // Ground
    ctx.fillStyle = '#708090';
    ctx.fillRect(0, groundPosition, canvas.width, canvas.height - groundPosition);
}

// --- Game Loop ---
let frameCount = 0;
function animate() {
    if (isGameOver) return;
    
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous frame

    drawBackground(); // Draw our new dynamic background
    // 
    drawRoadLines(); // 
    
    player.update();
    scoreText.draw();

    frameCount++;
    // Add new obstacles and collectibles periodically
    if (frameCount % 150 === 0) { // Increased spacing
        const itemType = Math.random();
        // --- FIX: Make objects smaller ---
        if (itemType > 0.4) {
            const size = 40; // Smaller obstacles
            obstacles.push(new Obstacle(canvas.width, groundPosition, size, gameSpeed));
        } else {
            const size = 35; // Smaller collectibles
            const y = (Math.random() < 0.5) ? groundPosition - 80 : groundPosition;
            collectibles.push(new Collectible(canvas.width, y, size, gameSpeed));
        }
    }
    
    // Update Obstacles & Collectibles (logic is the same)
    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        if (detectCollision(player, obstacle)) endGame();
        if (obstacle.x < -obstacle.size) obstacles.splice(index, 1);
    });
    collectibles.forEach((collectible, index) => {
        collectible.update();
        if (detectCollision(player, collectible)) {
            score++;
            gameSpeed += 0.1;
            collectibles.splice(index, 1);
        }
        if (collectible.x < -collectible.size) collectibles.splice(index, 1);
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
    gameOverScreen.style.display = 'flex'; // Use flex to center content
}

// --- Event Listeners ---
function handleStart() {
    if (isGameOver || !player) init();
    player.jump();
}

window.addEventListener('resize', init); // Re-initialize the game on resize

// Controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') handleStart();
});
window.addEventListener('touchstart', handleStart);

// This is the new, correct way to initialize the game
window.addEventListener('DOMContentLoaded', () => {
    // Set the initial canvas size based on the *actual* visible window
    setCanvasSize();
    
    // Now that sizing is correct, explicitly show the initial UI
    // (This prevents them from flashing on screen with the wrong size)
    startScreen.style.display = 'flex';
    instructions.style.display = 'block';
    gameOverScreen.style.display = 'none';
});






