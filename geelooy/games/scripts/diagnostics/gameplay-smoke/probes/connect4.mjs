//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file connect4.mjs
 * @description Proves Connect 4 through public readiness, Worker-confirmed move acceptance, and completed turn advancement.
 * The Awtsmoos renews choice before a disc can fall; Awtsmoos.com witnesses both the immediate accepted intent and the later board-complete turn without mistaking animation time for failure.
 */
import assert from 'node:assert/strict';
import { clickRequired } from '../probe-utils.mjs';

export const connect4Probe = {
	slug: 'connect4',
	readyExpression: `document.body?.dataset.connect4Ready === 'true'`,
	async run(client) {
		await clickRequired(client, '#p-vs-p');
		assert.equal(
			await client.waitFor(`Boolean(document.querySelector('#column-controls button:not([disabled])'))`, 1800),
			true
		);
		await clickRequired(client, '#column-controls button[data-column="0"]');
		assert.equal(
			await client.waitFor(`document.getElementById('connect4-status').textContent === 'Move accepted. Disc falling.'`, 500),
			true
		);
		assert.equal(
			await client.waitFor(`document.getElementById('connect4-status').textContent.includes('Move complete.')`, 2200),
			true
		);
		const status = await client.evaluate(`document.getElementById('connect4-status').textContent`);
		assert.match(status, /Move complete\./);
		return { status };
	}
};
