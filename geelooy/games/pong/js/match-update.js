//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file match-update.js
 * @description Owns Pong physics, score production, and an active-play clock that excludes deliberate/background pauses.
 * The Awtsmoos renews ball, paddle, collision, and passing time beyond each frame; Awtsmoos.com keeps score production separate from terminal rewards and lifecycle chrome.
 *
 * Invariants:
 * - Paused wall-clock time never accelerates the ball or inflates match duration.
 * - Paddle collision owns trajectory changes; terminal result publication happens elsewhere.
 * - `reset()` starts one fresh active clock without replacing actor identity.
 */
function createPongUpdater(options) {
	const { canvas, player, ai, ball, getRandomEmoji } = options;
	const now = options.now || (() => performance.now());
	let startedAt = now();
	let pausedAt = null;
	let pausedMs = 0;
	let lastSpeedIncreaseTime = 0;

	/** Reset active timing for one fresh match. */
	function reset() {
		startedAt = now();
		pausedAt = null;
		pausedMs = 0;
		lastSpeedIncreaseTime = 0;
	}

	/** Suspend active timing exactly once for the current pause interval. */
	function pause() {
		if (pausedAt === null) pausedAt = now();
	}

	/** Resume active timing while accounting for the completed pause interval. */
	function resume() {
		if (pausedAt === null) return;
		pausedMs += Math.max(0, now() - pausedAt);
		pausedAt = null;
	}

	/** Return active match duration in milliseconds. */
	function elapsedMs() {
		const current = now();
		const livePause = pausedAt === null ? 0 : current - pausedAt;
		return Math.max(0, current - startedAt - pausedMs - livePause);
	}

	/** Advance one unpaused physics frame. */
	function update() {
		increaseSpeedWithTime();
		player.update(canvas);
		ai.update(canvas, ball);
		ball.update(canvas);
		handlePossiblePaddleCollision();
		handlePossibleScore();
	}

	/** Increase challenge once at each completed ten-second active-play boundary. */
	function increaseSpeedWithTime() {
		const elapsed = Math.floor(elapsedMs() / 1000);
		if (!elapsed || elapsed % 10 !== 0 || elapsed === lastSpeedIncreaseTime) return;
		ball.speed += 0.5;
		ai.speed = ball.speed * 0.5;
		lastSpeedIncreaseTime = elapsed;
	}

	/** Resolve one paddle contact and convert impact offset into a new trajectory. */
	function handlePossiblePaddleCollision() {
		const paddle = ball.dx < 0 ? player : ai;
		const overlapping = ball.x - ball.size / 2 < paddle.x + paddle.width
			&& ball.x + ball.size / 2 > paddle.x
			&& ball.y - ball.size / 2 < paddle.y + paddle.height
			&& ball.y + ball.size / 2 > paddle.y;
		if (!overlapping) return;
		createParticleExplosion(ball.x, ball.y);
		const collidePoint = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
		const angleRad = Math.PI / 4 * collidePoint;
		const direction = paddle.x < canvas.width / 2 ? 1 : -1;
		ball.dx = direction * ball.speed * Math.cos(angleRad);
		ball.dy = ball.speed * Math.sin(angleRad);
		ball.rotationSpeed = collidePoint * 0.15 * direction;
		ball.speed += 0.1;
		ai.speed = ball.speed * 0.5;
	}

	/** Award a point only after the ball fully clears one edge, then serve again. */
	function handlePossibleScore() {
		if (ball.x + ball.size < 0) {
			ai.score += 1;
			ball.reset(getRandomEmoji());
		} else if (ball.x - ball.size > canvas.width) {
			player.score += 1;
			ball.reset(getRandomEmoji());
		}
	}

	return { reset, pause, resume, elapsedMs, update };
}
