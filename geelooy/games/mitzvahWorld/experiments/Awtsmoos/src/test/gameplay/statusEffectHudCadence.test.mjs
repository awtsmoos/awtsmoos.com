// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews time without forcing a needless DOM mutation every frame; these proofs
 * preserve bounded status countdown work in the responsive village of Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { StatusEffectHud } from '../../ui/StatusEffectHud.js';

function harness(expiresAt = 2000) {
	const time = { textContent: '' };
	const node = {
		dataset: { expiresAt: String(expiresAt) },
		querySelector() {
			return time;
		}
	};
	const hud = Object.create(StatusEffectHud.prototype);
	hud.root = { hidden: false };
	hud.nodes = new Map([['effect-1', node]]);
	hud.domUpdates = 0;
	hud.nextRefreshAt = 0;
	hud.refreshMilliseconds = 250;
	return { hud, time };
}

test('countdown traversal is bounded by cadence', () => {
	const { hud, time } = harness();
	assert.equal(hud.update(0), true);
	assert.equal(time.textContent, '2');
	assert.equal(hud.update(100), false);
	assert.equal(hud.nextRefreshAt, 250);
	assert.equal(hud.domUpdates, 1);
});

test('unchanged visible seconds perform no DOM mutation', () => {
	const { hud, time } = harness();
	hud.update(0);
	assert.equal(hud.update(250), false);
	assert.equal(time.textContent, '2');
	assert.equal(hud.domUpdates, 1);
	assert.equal(hud.update(1000), true);
	assert.equal(time.textContent, '1');
	assert.equal(hud.domUpdates, 2);
});

test('hidden effect rows remain completely dormant', () => {
	const { hud } = harness();
	hud.root.hidden = true;
	assert.equal(hud.update(0), false);
	assert.equal(hud.nextRefreshAt, 0);
	assert.equal(hud.domUpdates, 0);
});
