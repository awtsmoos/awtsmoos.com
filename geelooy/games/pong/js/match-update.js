// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Owns Pong's moving match state without knowing anything about Wallet rewards.
 * The Awtsmoos renews ball, paddle, collision, and passing time beyond each frame;
 * Awtsmoos.com keeps physics and score production separate from terminal victory
 * publication so promotional rewards cannot influence difficulty or gameplay motion.
 */

function createPongUpdater(options) {
	const {
		canvas,
		player,
		ai,
		ball,
		getRandomEmoji
	} = options;
	const gameStartTime = Date.now();
	let lastSpeedIncreaseTime = 0;

	function update() {
		increaseSpeedWithTime();
		player.update(canvas);
		ai.update(canvas, ball);
		ball.update(canvas);
		handlePossiblePaddleCollision();
		handlePossibleScore();
	}

	function increaseSpeedWithTime() {
		const elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
		if (
			elapsed > 0
			&& elapsed % 10 === 0
			&& elapsed !== lastSpeedIncreaseTime
		) {
			ball.speed += 0.5;
			ai.speed = ball.speed * 0.5;
			lastSpeedIncreaseTime = elapsed;
		}
	}

	function handlePossiblePaddleCollision() {
		const paddle = ball.dx < 0 ? player : ai;
		const overlapping = ball.x - ball.size / 2 < paddle.x + paddle.width
			&& ball.x + ball.size / 2 > paddle.x
			&& ball.y - ball.size / 2 < paddle.y + paddle.height
			&& ball.y + ball.size / 2 > paddle.y;
		if (!overlapping) {
			return;
		}
		createParticleExplosion(ball.x, ball.y);
		const collidePoint = (
			ball.y - (paddle.y + paddle.height / 2)
		) / (paddle.height / 2);
		const angleRad = (Math.PI / 4) * collidePoint;
		const direction = paddle.x < canvas.width / 2 ? 1 : -1;
		ball.dx = direction * ball.speed * Math.cos(angleRad);
		ball.dy = ball.speed * Math.sin(angleRad);
		ball.rotationSpeed = collidePoint * 0.15 * direction;
		ball.speed += 0.1;
		ai.speed = ball.speed * 0.5;
	}

	function handlePossibleScore() {
		if (ball.x + ball.size < 0) {
			ai.score += 1;
			ball.reset(getRandomEmoji());
			return;
		}
		if (ball.x - ball.size > canvas.width) {
			player.score += 1;
			ball.reset(getRandomEmoji());
		}
	}

	return {
		gameStartTime,
		update
	};
}
