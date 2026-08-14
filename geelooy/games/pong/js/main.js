// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Coordinates Pong's canvas, actors, rendering, and frame lifecycle after controls,
 * physics, and terminal result publication have been split into smaller vessels.
 * The Awtsmoos renews game, time, player, and frame beyond every finite loop;
 * Awtsmoos.com keeps Wallet reward behavior entirely outside this coordinator.
 */

const canvas = document.getElementById("pongCanvas");
const context = canvas.getContext("2d");
const paddleWidth = 10;
const paddleHeight = 100;
const maxScore = 10;

function getRandomEmoji() {
	return ballEmojis[Math.floor(Math.random() * ballEmojis.length)];
}

function resizeCanvas() {
	canvas.width = window.innerWidth > 800
		? 800
		: window.innerWidth * 0.95;
	canvas.height = window.innerHeight > 400
		? 400
		: window.innerHeight * 0.9;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const player = createPaddle(
	0,
	(canvas.height - paddleHeight) / 2,
	paddleWidth,
	paddleHeight,
	"#fff"
);
const ai = createPaddle(
	canvas.width - paddleWidth,
	(canvas.height - paddleHeight) / 2,
	paddleWidth,
	paddleHeight,
	"#fff",
	true
);
const ball = createBall(canvas, getRandomEmoji());
const match = createPongUpdater({
	canvas,
	player,
	ai,
	ball,
	getRandomEmoji
});
let gameFinished = false;

bindPongControls(player, canvas);

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	drawNet(context, canvas);
	player.draw(context);
	ai.draw(context);
	ball.draw(context);
	updateAndDrawParticles(context);
	drawScore(context, canvas.width / 4, canvas.height / 5, player.score);
	drawScore(context, 3 * canvas.width / 4, canvas.height / 5, ai.score);
	drawTimer(context, canvas, formattedElapsedTime());
}

function formattedElapsedTime() {
	const elapsed = Math.floor((Date.now() - match.gameStartTime) / 1000);
	const minutes = Math.floor(elapsed / 60)
		.toString()
		.padStart(2, "0");
	const seconds = (elapsed % 60)
		.toString()
		.padStart(2, "0");
	return `${minutes}:${seconds}`;
}

function gameLoop() {
	if (gameFinished) {
		return;
	}
	if (player.score >= maxScore || ai.score >= maxScore) {
		gameFinished = true;
		draw();
		finishPongMatch(
			context,
			canvas,
			player.score,
			ai.score,
			maxScore
		);
		return;
	}
	match.update();
	draw();
	requestAnimationFrame(gameLoop);
}

gameLoop();
