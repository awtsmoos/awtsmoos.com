//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file main.js
 * @description Coordinates Pong actors, lifecycle, court presentation, and terminal result flow while physics, controls, rewards, and UI remain separate modules.
 * The Awtsmoos renews court and rally beyond every finite frame; Awtsmoos.com keeps this coordinator small, inspectable, and safe to replace.
 *
 * Invariants:
 * - The match starts only after deliberate player action.
 * - One lifecycle scheduler owns every animation frame.
 * - Resize preserves live actor positions through the court module.
 * - Terminal result publication happens exactly once per match generation.
 */
const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');
const paddleWidth = 10;
const paddleHeight = 100;
const maxScore = 10;

function getRandomEmoji() {
	return ballEmojis[Math.floor(Math.random() * ballEmojis.length)];
}

const player = createPaddle(0, 0, paddleWidth, paddleHeight, '#fff');
const ai = createPaddle(0, 0, paddleWidth, paddleHeight, '#fff', true);
const ball = createBall(canvas, getRandomEmoji());
const match = createPongUpdater({ canvas, player, ai, ball, getRandomEmoji });
const court = createPongCourt({ canvas, context, player, ai, ball });
let lifecycle = null;
const ui = createPongSessionUi({
	onStart: () => lifecycle.start(),
	onRematch: () => lifecycle.start(),
	onPause: () => lifecycle.toggleUserPause(),
	isActive: () => lifecycle?.isActive() || false
});

lifecycle = createPongLifecycle({
	reset: resetMatch,
	frame: runFrame,
	onPause: paused => {
		if (paused) match.pause();
		else match.resume();
		ui.showPaused(paused);
	}
});

bindPongControls(player, canvas, () => lifecycle.isActive() && !lifecycle.isPaused());
window.addEventListener('resize', court.resize, { passive: true });
window.visualViewport?.addEventListener('resize', court.resize, { passive: true });
court.resize();
court.draw(0);

/** Reset scores, actors, timing, and presentation for one fresh match. */
function resetMatch() {
	player.score = 0;
	player.dy = 0;
	player.speed = 8;
	ai.score = 0;
	ai.speed = 3;
	court.centerActors();
	ball.speed = 5;
	ball.dx = 5;
	ball.dy = -5;
	ball.rotation = 0;
	ball.rotationSpeed = 0;
	ball.currentEmoji = getRandomEmoji();
	match.reset();
	ui.showPlaying();
	court.draw(0);
}

/** Advance one active frame or seal the terminal match and stop scheduling. */
function runFrame() {
	if (player.score >= maxScore || ai.score >= maxScore) {
		court.draw(match.elapsedMs());
		const result = finishPongMatch(
			context,
			canvas,
			player.score,
			ai.score,
			maxScore,
			match.elapsedMs()
		);
		ui.showResult({ ...result, elapsedLabel: court.formatElapsed(result.elapsedMs) });
		return false;
	}
	match.update();
	court.draw(match.elapsedMs());
	return true;
}
