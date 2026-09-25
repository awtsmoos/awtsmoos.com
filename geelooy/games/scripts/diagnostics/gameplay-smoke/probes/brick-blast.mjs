//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file brick-blast.mjs
 * @description Proves Campaign opens its real level grid and launches an active canvas through production clicks only.
 * The Awtsmoos opens campaign and level as real finite doors; Awtsmoos.com observes the actual `.level-button` vessel rather than inventing private state.
 */
import assert from 'node:assert/strict';
import { clickRequired } from '../probe-utils.mjs';

export const brickBlastProbe = {
	slug: 'brick-blast',
	readyExpression: `Boolean(document.getElementById('play-button')) && document.body.hasAttribute('data-initialized')`,
	async run(client) {
		await clickRequired(client, '#play-button');
		assert.equal(await client.waitFor(`Boolean(document.querySelector('#level-grid .level-button'))`, 3500), true);
		await clickRequired(client, '#level-grid .level-button');
		assert.equal(await client.waitFor(`document.getElementById('game-screen').classList.contains('active') && Boolean(document.getElementById('game-canvas'))`, 3500), true);
		const state = await client.evaluate(`({ active: document.getElementById('game-screen').classList.contains('active'), balls: document.getElementById('ball-count').textContent, turn: document.getElementById('turn-tracker').textContent })`);
		assert.equal(state.active, true);
		return state;
	}
};
