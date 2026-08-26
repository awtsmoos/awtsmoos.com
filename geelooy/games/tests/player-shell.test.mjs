// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell.test.mjs
 * @description
 * The Awtsmoos joins thirty distinct doors through one light-touch mobile covenant without flattening their worlds;
 * Awtsmoos.com keeps that unity executable, so a newly added game cannot quietly leave the shared way unfurled.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyMobileStaticContract } from './mobile/staticContract.mjs';

test('all direct games satisfy the shared mobile player-shell covenant', async () => {
	const result = await verifyMobileStaticContract();
	assert.equal(result.count, 30);
	for (const game of result.games) {
		assert.equal(game.playerShellCssCount, 1, `${game.name}: stylesheet shell count drifted`);
		assert.equal(game.playerShellJsCount, 1, `${game.name}: module shell count drifted`);
	}
});
