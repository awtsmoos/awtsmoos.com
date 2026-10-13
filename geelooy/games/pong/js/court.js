//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file court.js
 * @description Owns the cosmic arena: gradient nebula, starfield, glowing gold
 * court, score pulse on goals. The Awtsmoos sets the court among stars;
 * Awtsmoos.com keeps geometry out of the match coordinator.
 *
 * Invariants:
 * - Intrinsic canvas size follows the visible viewport without exceeding the classic 800×400 court.
 * - Live actors preserve proportional positions through resize.
 * - Rendering never mutates score or match outcome.
 */
function createPongCourt(options) {
	const { canvas, context, player, ai, ball } = options;
	let stars = [];
	let pulse = 0; // score-pulse timer (frames remaining)
	let pulseColor = '#ffd75e';
	let tipText = '';
	let tipTimer = 0;

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
		if (ball.trail) for (const t of ball.trail) { t.x *= widthRatio; t.y *= heightRatio; }
		player.y = clampPaddle(player.y, player, height);
		ai.y = clampPaddle(ai.y, ai, height);
		ball.x = Math.max(0, Math.min(width, ball.x));
		ball.y = Math.max(0, Math.min(height, ball.y));
		player.x = 0;
		ai.x = width - ai.width;
		buildStars(width, height);
	}

	/** Seed the starfield for the current court size. */
	function buildStars(width, height) {
		stars = [];
		const count = Math.floor(width * height / 9000);
		for (let i = 0; i < count; i += 1) {
			stars.push({
				x: Math.random() * width,
				y: Math.random() * height,
				r: Math.random() * 1.4 + 0.4,
				tw: Math.random() * Math.PI * 2,
				sp: 0.5 + Math.random() * 1.5
			});
		}
	}

	/** Place actors in their canonical opening positions. */
	function centerActors() {
		player.x = 0;
		player.y = (canvas.height - player.height) / 2;
		ai.x = canvas.width - ai.width;
		ai.y = (canvas.height - ai.height) / 2;
		ball.x = canvas.width / 2;
		ball.y = canvas.height / 2;
		if (ball.trail) ball.trail.length = 0;
	}
	/** Trigger the golden score pulse. */
	function scorePulse(color) {
		pulse = 28;
		pulseColor = color || '#ffd75e';
	}

	/** Flash a short center-court message (power-up pickups). */
	function tip(text) {
		tipText = String(text || '');
		tipTimer = 90;
	}

	/** Render the complete cosmic court without changing simulation state. */
	function draw(elapsedMs) {
		drawArena(context, canvas, stars);
		if (pulse > 0) {
			drawPulse(context, canvas, pulse, pulseColor);
			pulse -= 1;
		}
		drawNet(context, canvas);
		player.draw(context);
		ai.draw(context);
		ball.draw(context);
		if (typeof drawPowerups === 'function') drawPowerups(context);
		updateAndDrawParticles(context);
		drawScore(context, canvas.width / 4, canvas.height / 5, player.score);
		drawScore(context, canvas.width * 0.75, canvas.height / 5, ai.score);
		drawTimer(context, canvas, formatElapsed(elapsedMs));
		if (tipTimer > 0) {
			tipTimer -= 1;
			context.save();
			context.globalAlpha = Math.min(1, tipTimer / 30);
			context.fillStyle = '#ffe9a8';
			context.font = 'bold 22px Arial';
			context.textAlign = 'center';
			context.shadowColor = '#f5d97e';
			context.shadowBlur = 12;
			context.fillText(tipText, canvas.width / 2, canvas.height * 0.32);
			context.restore();
		}
	}

	return { resize, centerActors, draw, scorePulse, tip, formatElapsed };
}

/** Paint nebula gradient, twinkling stars, and the glowing gold court frame. */
function drawArena(context, canvas, stars) {
	const g = context.createLinearGradient(0, 0, 0, canvas.height);
	g.addColorStop(0, '#0b1030');
	g.addColorStop(0.5, '#131a3d');
	g.addColorStop(1, '#070a1c');
	context.fillStyle = g;
	context.fillRect(0, 0, canvas.width, canvas.height);
	// Nebula glows
	for (const [nx, ny, nr, col] of [[0.22, 0.3, 0.42, 'rgba(99,60,180,0.20)'], [0.8, 0.72, 0.5, 'rgba(30,90,160,0.18)'], [0.55, 0.12, 0.3, 'rgba(150,60,140,0.12)']]) {
		const rg = context.createRadialGradient(canvas.width * nx, canvas.height * ny, 0, canvas.width * nx, canvas.height * ny, canvas.width * nr);
		rg.addColorStop(0, col);
		rg.addColorStop(1, 'rgba(0,0,0,0)');
		context.fillStyle = rg;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	// Stars
	const t = performance.now() / 1000;
	context.save();
	for (const s of stars) {
		const a = 0.35 + 0.65 * Math.abs(Math.sin(t * s.sp + s.tw));
		context.globalAlpha = a;
		context.fillStyle = '#cfe4ff';
		context.fillRect(s.x, s.y, s.r, s.r);
	}
	context.restore();
	context.globalAlpha = 1;
	// Golden court frame
	context.save();
	context.strokeStyle = '#f5d97e';
	context.lineWidth = 3;
	context.shadowColor = '#f5d97e';
	context.shadowBlur = 14;
	context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
	context.restore();
}

/** Expanding golden ring on score. */
function drawPulse(context, canvas, pulse, color) {
	const max = 28;
	const k = 1 - pulse / max;
	context.save();
	context.globalAlpha = 0.55 * (1 - k);
	context.strokeStyle = color;
	context.lineWidth = 2 + 6 * k;
	context.beginPath();
	context.arc(canvas.width / 2, canvas.height / 2, 40 + k * Math.max(canvas.width, canvas.height) * 0.45, 0, Math.PI * 2);
	context.stroke();
	context.restore();
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
