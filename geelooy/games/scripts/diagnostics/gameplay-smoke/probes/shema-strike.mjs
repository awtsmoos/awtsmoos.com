//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shema-strike.mjs
 * @description Proves Shema Strike begins a real campaign, consumes semantic
 * keyboard movement, and pauses/resumes through its production input controller.
 *
 * Invariants:
 * - Campaign start uses the visible New Game button.
 * - Movement travels through KeyboardEvent input, never direct player mutation.
 * - Pause truth is read from the live Game object already exposed by production.
 */
import assert from 'node:assert/strict';
import {
	clickRequired,
	dispatchKey,
	moveThroughKeyboard,
	sleep
} from '../probe-utils.mjs';

export const shemaStrikeProbe = {
	slug: 'shema-strike',
	readyExpression: 'Boolean(window.__SHEMA_STRIKE__)',
	async run(client) {
		await clickRequired(client, '#new-button');
		const started = await client.waitFor(`window.__SHEMA_STRIKE__?.state === 'playing'`, 8000);
		assert.equal(started, true, 'Shema Strike did not enter gameplay');
		const movement = await moveThroughKeyboard(client, () => snapshot(client));
		await tapPause(client);
		const paused = await snapshot(client);
		assert.equal(paused.state, 'paused');
		await tapPause(client);
		const resumed = await snapshot(client);
		assert.equal(resumed.state, 'playing');
		return { movement, paused, resumed };
	}
};

/** Send one edge-triggered Pause action through the normal keyboard path. */
async function tapPause(client) {
	await dispatchKey(client, 'keydown', 'KeyP', 'p');
	await dispatchKey(client, 'keyup', 'KeyP', 'p');
	await sleep(120);
}

/** Read canonical Shema Strike state without consuming input or advancing time. */
function snapshot(client) {
	return client.evaluate(`(() => {
		const game = __SHEMA_STRIKE__;
		return {
			state: game.state,
			x: game.player?.x ?? 0,
			y: game.player?.y ?? 0,
			stage: game.stageNumber
		};
	})()`);
}
