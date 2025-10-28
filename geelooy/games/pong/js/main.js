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
    createParticleExplosion(ball.x, ball.y);

    const collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
    const angleRad = (Math.PI / 4) * collidePoint;
    const direction = (paddle.x < canvas.width / 2) ? 1 : -1;

    ball.dx = direction * ball.speed * Math.cos(angleRad);
    ball.dy = ball.speed * Math.sin(angleRad);
    ball.rotationSpeed = (collidePoint * 0.15) * direction;
    ball.speed += 0.1;

    // --- ADAPTIVE AI SPEED on HIT ---
    // The AI's speed is a percentage of the ball's speed, making it challenging but fair.
    ai.speed = ball.speed * 0.85;
}

function update() {
    const elapsedTime = Math.floor((Date.now() - gameStartTime) / 1000);
    if (elapsedTime > 0 && elapsedTime % 10 === 0 && elapsedTime !== lastSpeedIncreaseTime) {
        ball.speed += 0.5;
        lastSpeedIncreaseTime = elapsedTime;

        // --- ADAPTIVE AI SPEED on TIME ---
        ai.speed = ball.speed * 0.85;
    }

    player.update(canvas);
    ai.update(canvas, ball);
    ball.update(canvas);

    const currentPaddle = ball.dx < 0 ? player : ai;
    if (ball.x - ball.size / 2 < currentPaddle.x + currentPaddle.width &&
        ball.x + ball.size / 2 > currentPaddle.x &&
        ball.y - ball.size / 2 < currentPaddle.y + currentPaddle.height &&
        ball.y + ball.size / 2 > currentPaddle.y) {
        handlePaddleCollision(ball, currentPaddle);
    }
    
    if (ball.x + ball.size < 0) {
        ai.score++;
        ball.reset(getRandomEmoji());
    } else if (ball.x - ball.size > canvas.width) {
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
    
    updateAndDrawParticles(context);

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

// Window-wide Mobile touch controls
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