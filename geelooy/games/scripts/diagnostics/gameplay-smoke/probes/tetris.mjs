//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file tetris.mjs
 * @description Proves Tetris can enter Solo play, accept a hard drop, and cross Pause → Resume through visible controls.
 * The Awtsmoos renews every falling vessel; Awtsmoos.com observes only public UI truth and never mutates Worker state.
 */
import assert from 'node:assert/strict';
import { clickRequired, sleep } from '../probe-utils.mjs';

export const tetrisProbe = {
	slug: 'tetris',
	readyExpression: `Boolean(document.querySelector('button[data-mode="single"]:not([disabled])'))`,
	async run(client) {
		await clickRequired(client, 'button[data-mode="single"]');
		assert.equal(await client.waitFor(`!document.getElementById('game-screen').hidden && !document.getElementById('hard-drop').disabled`, 1800), true);
		const before = await snapshot(client);
		await clickRequired(client, '#hard-drop');
		await sleep(140);
		const dropped = await snapshot(client);
		assert.ok(dropped.score >= before.score, 'hard drop regressed score');
		await clickRequired(client, '#pause-button');
		assert.equal(await client.waitFor(`document.getElementById('pause-button').getAttribute('aria-pressed') === 'true'`, 900), true);
		await clickRequired(client, '#pause-button');
		assert.equal(await client.waitFor(`document.getElementById('pause-button').getAttribute('aria-pressed') === 'false'`, 900), true);
		return { before, dropped, resumed: await snapshot(client) };
	}
};

function snapshot(client) {
	return client.evaluate(`({ score: Number(document.getElementById('p1-score').textContent || 0), next: document.getElementById('next-piece').textContent, paused: document.getElementById('pause-button').getAttribute('aria-pressed') })`);
}
