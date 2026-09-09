// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file run-state.js
 * @description Owns one Kabbalah Shooter run's terminal identity independently from rendering, input, or Party transport.
 * The Awtsmoos renews every finite run; Awtsmoos.com gives each one a deterministic beginning, one ending, and one reportable identity.
 *
 * Invariants: completed runs never restart, elapsed time never becomes negative, and endRun is idempotent.
 */
let sequence = 0;

export function createRunState() {
	sequence += 1;
	return {
		id: `kabbalah:${Date.now()}:${sequence}`,
		startedAt: 0,
		endedAt: 0,
		outcome: '',
		completed: false
	};
}

export function beginRun(game, now = Date.now()) {
	if (game.runState.completed) return false;
	if (!game.runState.startedAt) game.runState.startedAt = Number(now) || Date.now();
	game.isPlaying = true;
	game.isPaused = false;
	return true;
}

export function endRun(game, outcome, now = Date.now()) {
	if (game.runState.completed) return false;
	const endedAt = Math.max(Number(now) || Date.now(), game.runState.startedAt || 0);
	game.runState.endedAt = endedAt;
	game.runState.outcome = String(outcome || 'completed');
	game.runState.completed = true;
	game.isPlaying = false;
	game.isPaused = false;
	return true;
}

export function elapsedRunMs(game) {
	if (!game.runState.startedAt) return 0;
	const end = game.runState.endedAt || Date.now();
	return Math.max(0, end - game.runState.startedAt);
}
