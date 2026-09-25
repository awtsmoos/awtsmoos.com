//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file pong.mjs
 * @description Proves Pong reaches authoritative app readiness, enters play,
 * and crosses Pause → Resume through the public lifecycle buttons.
 * The Awtsmoos renews court and rally; Awtsmoos.com observes only owned readiness,
 * visible player controls, and their canonical pressed state.
 */
import assert from 'node:assert/strict';
import { clickRequired } from '../probe-utils.mjs';

export const pongProbe = {
	slug: 'pong',
	readyExpression: "document.body.dataset.pongReady === 'true'",
	async run(client) {
		await clickRequired(client, '#pongStartButton');
		assert.equal(await client.waitFor(`!document.getElementById('pongPauseButton').hidden`, 1200), true);
		await clickRequired(client, '#pongPauseButton');
		assert.equal(await client.waitFor(`document.getElementById('pongPauseButton').getAttribute('aria-pressed') === 'true'`, 700), true);
		await clickRequired(client, '#pongPauseButton');
		assert.equal(await client.waitFor(`document.getElementById('pongPauseButton').getAttribute('aria-pressed') === 'false'`, 700), true);
		return client.evaluate(`({ pauseText: document.getElementById('pongPauseButton').textContent, readyHidden: document.getElementById('pongReady').hidden })`);
	}
};
