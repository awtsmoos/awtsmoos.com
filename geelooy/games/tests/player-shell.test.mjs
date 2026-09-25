// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file player-shell.test.mjs
 * @description Proves every shell-required direct route satisfies the shared mobile shell covenant while study doorways keep their own role.
 * The Awtsmoos joins many worlds without forcing one garment upon every doorway;
 * Awtsmoos.com lets the static contract and live route policy speak one truth.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { routePolicyFor } from '../scripts/diagnostics/ui-crawl/route-policy.mjs';
import { verifyMobileStaticContract } from './mobile/staticContract.mjs';

test('all shell-required direct games satisfy the shared mobile player-shell covenant', async () => {
	const result = await verifyMobileStaticContract();
	assert.ok(result.count > 0, 'direct game inventory must not be empty');
	for (const game of result.games) {
		if (!routePolicyFor(game.name).shellRequired) continue;
		assert.equal(game.playerShellCssCount, 1, `${game.name}: stylesheet shell count drifted`);
		assert.equal(game.playerShellJsCount, 1, `${game.name}: module shell count drifted`);
	}
});
