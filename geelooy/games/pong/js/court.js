//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file court.js
 * @description Owns Pong canvas sizing, actor-preserving resize, rendering, and elapsed-time presentation without knowing lifecycle or result policy.
 * The Awtsmoos renews dimensions and visibility beyond every finite viewport; Awtsmoos.com keeps geometry out of the match coordinator.
 *
 * Invariants:
 * - Intrinsic canvas size follows the visible viewport without exceeding the classic 800×400 court.
 * - Live actors preserve proportional positions through resize.
 * - Rendering never mutates score or match outcome.
 */
function createPongCourt(options) {
	const { canvas, context, player, ai, ball } = options;

	/** Fit the court to the visible viewport and preserve current actor positions. */
	function resize() {
		const previousWidth = Math.max(1, canvas.width);
		const previousHeight = Math.max(1, canvas.height);
		const viewport = window.visualViewport;
		const availableWidth = viewport?.width || innerWidth;
		const availableHeight = viewport?.height || innerHeight;
		const width = Math.min(800, Math.max(280, Math.floor(availableWidth * 0.95)));
		const height = Math.min(400, Math.max(220, Math.floor(availableHeight * 0.82)));
		const widthRatio = width / previousWidth;
		const heightRatio = height / previousHeight;
		canvas.width = width;
		canvas.height = height;
		player.y *= heightRatio;
		ai.y *= heightRatio;
		ball.x *= widthRatio;
		ball.y *= heightRatio;
		player.y = clampPaddle(player.y, player, height);
		ai.y = clampPaddle(ai.y, ai, height);
		ball.x = Math.max(0, Math.min(width, ball.x));
		ball.y = Math.max(0, Math.min(height, ball.y));
		player.x = 0;
		ai.x = width - ai.width;
	}

	/** Place actors in their canonical opening positions. */
	function centerActors() {
		player.x = 0;
		player.y = (canvas.height - player.height) / 2;
		ai.x = canvas.width - ai.width;
		ai.y = (canvas.height - ai.height) / 2;
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
	}
	/** Render the complete current court without changing simulation state. */
	function draw(elapsedMs) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		drawNet(context, canvas);
		player.draw(context);
		ai.draw(context);
		ball.draw(context);
		updateAndDrawParticles(context);
		drawScore(context, canvas.width / 4, canvas.height / 5, player.score);
		drawScore(context, canvas.width * 0.75, canvas.height / 5, ai.score);
		drawTimer(context, canvas, formatElapsed(elapsedMs));
	}

	return { resize, centerActors, draw, formatElapsed };
}

/** Convert active milliseconds to stable mm:ss match presentation. */
function formatElapsed(milliseconds) {
	const elapsed = Math.max(0, Math.floor((milliseconds || 0) / 1000));
	const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
	const seconds = String(elapsed % 60).padStart(2, '0');
	return `${minutes}:${seconds}`;
}

/** Clamp a paddle top edge to the current court height. */
function clampPaddle(candidate, paddle, height) {
	return Math.min(Math.max(0, height - paddle.height), Math.max(0, candidate));
}
