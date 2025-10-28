//B"H
// js/main.js

const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");

const paddleWidth = 10;
const paddleHeight = 100;
const maxScore = 10;



function getRandomEmoji() {
    return ballEmojis[Math.floor(Math.random() * ballEmojis.length)];
}

let gameStartTime = Date.now();
let lastSpeedIncreaseTime = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth * 0.95;
    canvas.height = window.innerHeight > 400 ? 400 : window.innerHeight * 0.9;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const player = createPaddle(0, (canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight, '#fff');
const ai = createPaddle(canvas.width - paddleWidth, (canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight, '#fff', true);
const ball = createBall(canvas, getRandomEmoji());

function handlePaddleCollision(ball, paddle) {
    // 1. Create a high-performance particle explosion
    createParticleExplosion(ball.x, ball.y);

    // 2. Calculate collision physics
    const collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    const angleRad = (Math.PI / 4) * collidePoint;
    const direction = (paddle.x < canvas.width / 2) ? 1 : -1;

    // 3. Update ball velocity
    ball.dx = direction * ball.speed * Math.cos(angleRad);
    ball.dy = ball.speed * Math.sin(angleRad);
    
    // 4. Add realistic spin based on where it hit the paddle
    ball.rotationSpeed = (collidePoint * 0.15) * direction;

    // 5. Increase ball speed slightly on every hit to make it more intense
    ball.speed += 0.1;
}

function update() {
    // Timer-based speed increase
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    if (elapsedTime > 0 && elapsedTime % 10 === 0 && elapsedTime !== lastSpeedIncreaseTime) {
        ball.speed += 0.5; // More significant speed boost
        lastSpeedIncreaseTime = elapsedTime;
    }

    player.update(canvas);
    ai.update(canvas, ball);
    ball.update(canvas);

    // Collision Detection (adjusted for emoji size)
    const currentPaddle = ball.dx < 0 ? player : ai;
    if (ball.x - ball.size / 2 < currentPaddle.x + currentPaddle.width &&
        ball.x + ball.size / 2 > currentPaddle.x &&
        ball.y - ball.size / 2 < currentPaddle.y + currentPaddle.height &&
        ball.y + ball.size / 2 > currentPaddle.y) {
        
        handlePaddleCollision(ball, currentPaddle);
    }
    
    // Scoring
    if (ball.x + ball.size < 0) { // Off the left side
        ai.score++;
        ball.reset(getRandomEmoji());
    } else if (ball.x - ball.size > canvas.width) { // Off the right side
        player.score++;
        ball.reset(getRandomEmoji());
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawNet(context, canvas);
    player.draw(context);
    ai.draw(context);
    ball.draw(context);
    
    // Draw particles on top of everything
    updateAndDrawParticles(context);

    // Draw UI
    drawScore(context, canvas.width / 4, canvas.height / 5, player.score);
    drawScore(context, 3 * canvas.width / 4, canvas.height / 5, ai.score);
    const elapsedTimeInSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
    const minutes = Math.floor(elapsedTimeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (elapsedTimeInSeconds % 60).toString().padStart(2, '0');
    drawTimer(context, canvas, `${minutes}:${seconds}`);
}

function gameLoop() {
    if (player.score >= maxScore || ai.score >= maxScore) {
        draw();
        displayWinner(context, canvas, player.score >= maxScore ? "Player" : "AI");
        return;
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Window-wide Mobile touch controls ---
let touchStartY = 0;
let playerStartDragY = 0;
document.addEventListener("touchstart", e => {
    e.preventDefault();
    if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
        playerStartDragY = player.y;
    }
}, { passive: false });
document.addEventListener("touchmove", e => {
    e.preventDefault();
    if (e.touches.length > 0) {
        const deltaY = e.touches[0].clientY - touchStartY;
        let newY = playerStartDragY + deltaY;
        if (newY < 0) newY = 0;
        if (newY + player.height > canvas.height) newY = canvas.height - player.height;
        player.y = newY;
    }
}, { passive: false });

// Keyboard controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") player.dy = -player.speed;
    else if (e.key === "ArrowDown") player.dy = player.speed;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player.dy = 0;
});

// Start the game
gameLoop();