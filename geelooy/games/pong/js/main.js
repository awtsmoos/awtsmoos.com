//B"H

const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");

const paddleWidth = 10;
const paddleHeight = 100;
const maxScore = 10;

function resizeCanvas() {
    canvas.width = window.innerWidth > 800 ? 800 : window.innerWidth * 0.95;
    canvas.height = window.innerHeight > 400 ? 400 : window.innerHeight * 0.9;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const player = createPaddle(0, (canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight, '#fff');
const ai = createPaddle(canvas.width - paddleWidth, (canvas.height - paddleHeight) / 2, paddleWidth, paddleHeight, '#fff', true);
const ball = createBall(canvas);

function checkCollision(ball, paddle) {
    return ball.x < paddle.x + paddle.width &&
           ball.x + ball.size > paddle.x &&
           ball.y < paddle.y + paddle.height &&
           ball.y + ball.size > paddle.y;
}

function update() {
    player.update(canvas);
    ai.update(canvas, ball);
    ball.update(canvas);

    // Collision with paddles
    if (checkCollision(ball, player)) {
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        ball.dx = ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        ball.speed += ball.acceleration;
    } else if (checkCollision(ball, ai)) {
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        let angleRad = (Math.PI / 4) * collidePoint;
        ball.dx = -ball.speed * Math.cos(angleRad);
        ball.dy = ball.speed * Math.sin(angleRad);
        ball.speed += ball.acceleration;
    }

    // Scoring
    if (ball.x < 0) {
        ai.score++;
        ball.reset();
    } else if (ball.x + ball.size > canvas.width) {
        player.score++;
        ball.reset();
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawNet(context, canvas);
    player.draw(context);
    ai.draw(context);
    ball.draw(context);
    drawScore(context, canvas.width / 4, canvas.height / 5, player.score);
    drawScore(context, 3 * canvas.width / 4, canvas.height / 5, ai.score);
}

function gameLoop() {
    if (player.score >= maxScore || ai.score >= maxScore) {
        draw(); // Draw final state
        const winner = player.score >= maxScore ? "Player" : "AI";
        displayWinner(context, canvas, winner);
        return; // Stop the loop
    }

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") player.dy = -player.speed;
    else if (e.key === "ArrowDown") player.dy = player.speed;
});

document.addEventListener("keyup", e => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") player.dy = 0;
});

// Mobile touch controls
canvas.addEventListener("touchmove", e => {
    e.preventDefault(); // Prevent screen from moving
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    player.y = touch.clientY - rect.top - player.height / 2;
});

// Start the game
gameLoop();