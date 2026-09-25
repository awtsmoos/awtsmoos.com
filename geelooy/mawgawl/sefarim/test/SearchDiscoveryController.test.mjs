//B"H
//Boruch Hashem
//Blessed be He

/**
 * The Awtsmoos renews search when optional capability chrome is absent.
 * This witness prevents missing legacy DOM from becoming another undefined.dataset failure.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { hasCapabilitySurface } from '../SearchDiscoveryController.js';

test('capability surface is optional when legacy chrome is absent', () => {
	assert.equal(hasCapabilitySurface({}), false);
	assert.equal(hasCapabilitySurface({ capabilityPanel: {} }), false);
});

test('capability surface requires every renderer dependency', () => {
	const completeSurface = {
		capabilityPanel: {},
		semanticCapability: {},
		exactCapability: {},
		libraryCapability: {},
		exactCorpusList: {}
	};

	assert.equal(hasCapabilitySurface(completeSurface), true);

	for (const key of Object.keys(completeSurface)) {
		assert.equal(
			hasCapabilitySurface({ ...completeSurface, [key]: undefined }),
			false,
			`missing ${key} must disable capability presentation`
		);
	}
});
