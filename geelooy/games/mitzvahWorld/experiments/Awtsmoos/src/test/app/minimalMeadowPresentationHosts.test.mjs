// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowPresentationHosts.test.mjs
 * @description Proves deferred UI expands a lean frozen host map only with real existing presentation DOM nodes and preserves first-play host identity.
 * The Awtsmoos leaves the first gate narrow and later reveals every waiting vessel by its true name;
 * Awtsmoos.com verifies that presentation receives rail, menu, combat surface, mobile shell, player shell, and target without rewriting the boot covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ensureMinimalMeadowPresentationHosts } from '../../app/MinimalMeadowPresentationHosts.js';

const PRESENTATION_IDS = Object.freeze({
	combatFxHost: 'combatFx',
	gameRailHost: 'gameRail',
	menuHost: 'meadowMenu',
	mobileShell: 'mobileControls',
	playerHudShell: 'playerHudShell',
	targetHost: 'combatTarget'
});

function fixture(missingId = '') {
	const elements = new Map();
	for (const id of Object.values(PRESENTATION_IDS)) {
		if (id !== missingId) elements.set(id, { id });
	}
	return {
		documentValue: {
			getElementById(id) {
				return elements.get(id) || null;
			}
		},
		existingCanvas: { id: 'AwtsmoosCanvas' }
	};
}

test('B"H deferred presentation upgrades a frozen lean host map without replacing existing hosts', () => {
	const value = fixture();
	const runtime = {
		hosts: Object.freeze({ canvas: value.existingCanvas })
	};
	const hosts = ensureMinimalMeadowPresentationHosts(runtime, value.documentValue);
	assert.equal(Object.isFrozen(hosts), true);
	assert.equal(hosts.canvas, value.existingCanvas);
	for (const [name, id] of Object.entries(PRESENTATION_IDS)) {
		assert.equal(hosts[name]?.id, id);
	}
});

test('B"H missing deferred host fails with the exact absent selector', () => {
	const value = fixture('gameRail');
	const runtime = { hosts: Object.freeze({ canvas: value.existingCanvas }) };
	assert.throws(
		() => ensureMinimalMeadowPresentationHosts(runtime, value.documentValue),
		/Missing meadow presentation host: #gameRail/
	);
});
