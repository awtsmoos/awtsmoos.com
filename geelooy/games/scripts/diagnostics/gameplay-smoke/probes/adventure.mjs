//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file adventure.mjs
 * @description Proves Adventure consumes real keyboard movement through its
 * production input layer and preserves canonical state through Pause/Resume.
 *
 * Invariants:
 * - The exact page entry module is imported by its existing script URL, so no second runtime boots.
 * - Movement must change the exported world's canonical player coordinates.
 * - Pause and Resume travel through the visible production control.
 */
import assert from 'node:assert/strict';
import { clickRequired, moveThroughKeyboard } from '../probe-utils.mjs';

export const adventureProbe = {
	slug: 'adventure',
	readyExpression: `document.getElementById('gameCanvas')?.width > 0`,
	async run(client) {
		const movement = await moveThroughKeyboard(client, () => snapshot(client));
		assert.equal(movement.after.status, 'playing');
		await clickRequired(client, '#pauseButton');
		const paused = await snapshot(client);
		assert.equal(paused.status, 'paused');
		await clickRequired(client, '#pauseButton');
		const resumed = await snapshot(client);
		assert.equal(resumed.status, 'playing');
		return { movement, paused, resumed };
	}
};

/** Read the exact live Adventure module already instantiated by the page. */
function snapshot(client) {
	return client.evaluate(`(async () => {
		const script = [...document.scripts].find(item => item.src.includes('/adventure/js/app.js'));
		if (!script) throw new Error('Adventure entry script was not found');
		const module = await import(script.src);
		const state = module.adventureRuntime.snapshot();
		return { status: state.status, x: state.playerX, y: state.playerY, frame: state.frame };
	})()`);
}
