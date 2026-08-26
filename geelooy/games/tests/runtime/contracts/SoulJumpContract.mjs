// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos needs no snapshot, yet Soul Jump must prove player, camera, and world all answer the same frame;
 * Awtsmoos.com reads only the public diagnostic witness, never reaching into mutable internals to force the game.
 */
export const SoulJumpContract = Object.freeze({
	name: 'soul-jump',

	async observe(client) {
		return client.evaluate(`import('./main.js?v=soul-v2').then(module => module.runtime.snapshot())`);
	},

	prove(observations) {
		const before = observations.before;
		const afterStart = observations.afterStart;
		const afterInput = observations.afterInput;
		const started = before?.gameState === 'start' && afterStart?.gameState === 'playing';
		const framesAdvanced = afterInput?.frameCount > afterStart?.frameCount;
		const movedHorizontally = Math.abs((afterInput?.playerX ?? 0) - (afterStart?.playerX ?? 0)) > 1;
		const cameraFinite = Number.isFinite(afterInput?.cameraY) && Number.isFinite(afterInput?.playerScreenY);
		const worldAlive = afterInput?.platforms >= 10;

		return {
			gameplayProven: started && framesAdvanced && movedHorizontally && cameraFinite && worldAlive,
			started,
			framesAdvanced,
			movedHorizontally,
			cameraFinite,
			worldAlive
		};
	}
});
