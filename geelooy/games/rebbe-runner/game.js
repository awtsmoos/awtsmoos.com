//B"H



const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
let player, obstacles, collectibles, score, gameSpeed, isGameOver;
let groundPosition, scoreText;
let clouds = [], buildings = []; // Arrays for our background elements
let roadLines = [];

// --- Game Setup ---
// 

function resizeCanvas() {
    // Use the visualViewport for the true visible area.
    const vv = window.visualViewport;
    canvas.width = vv.width;
    canvas.height = vv.height;

    // Recalculate all vertical positions based on the new height.
    // --- CHANGE: Raise the ground to be 1/3 of the way up the screen ---
    groundPosition = vv.height * 2 / 3;

    // Safely reposition existing game elements if the game is running
    if (player) {
        player.groundY = groundPosition;
        if (!player.isJumping) {
            player.y = groundPosition;
        }
    }
    if (roadLines.length > 0) {
        roadLines.forEach(line => line.y = groundPosition + 25);
    }
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
    ;
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

    // --- CHANGE: Gradually increase game speed over time ---
    gameSpeed += 0.002;

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
        // --- CHANGE: Ensure all objects on screen accelerate with the game ---
        obstacle.speed = gameSpeed;
        obstacle.update();
        if (detectCollision(player, obstacle)) endGame();
        if (obstacle.x < -obstacle.size) obstacles.splice(index, 1);
    });
    collectibles.forEach((collectible, index) => {
        // --- CHANGE: Ensure all objects on screen accelerate with the game ---
        collectible.speed = gameSpeed;
        collectible.update();
        if (detectCollision(player, collectible)) {
            score++;
            // --- CHANGE: Make the speed boost from collecting a Mitzvah more significant ---
            gameSpeed += 0.25;
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

// This function handles starting the game
function handleStart() {
    if (isGameOver || !player) {
        init();
    } else {
        player.jump();
    }
}

// This is the new, reliable startup sequence.
window.addEventListener('DOMContentLoaded', () => {
    // 1. Perform the first resize to fit the screen.
    resizeCanvas();
    
    // 2. Show the initial UI.
    startScreen.style.display = 'flex';
    instructions.style.display = 'block';

    // 3. Set up the reliable resize listener for the visual viewport.
    // This is the key to fixing the mobile UI bug.
    window.visualViewport.addEventListener('resize', resizeCanvas);
});

// Add listeners for user input.
window.addEventListener('keydown', (e) => { if (e.code === 'Space') handleStart(); });
window.addEventListener('touchstart', handleStart);