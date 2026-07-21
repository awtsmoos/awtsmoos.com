// B"H
// Boruch Hashem
// Blessed is He

/** @file torahStatusEffectCatalog.test.mjs @description Verifies complete immutable effect data. */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	TORAH_STATUS_EFFECT_CATALOG,
	torahStatusEffectDefinition
} from '../../gameplay/combat/TorahStatusEffectCatalog.js';

const REQUIRED_FIELDS = Object.freeze([
	'bossBehavior', 'dispelCategory', 'durationMilliseconds', 'icon', 'id', 'maximumStacks',
	'modifiers', 'persistenceRule', 'questEventRule', 'refreshRule', 'stackingRule',
	'tickIntervalMilliseconds', 'title', 'tooltip'
]);

test('every status effect defines bounded timeline and UI behavior', () => {
	assert.equal(TORAH_STATUS_EFFECT_CATALOG.length, 10);
	for (const effect of TORAH_STATUS_EFFECT_CATALOG) {
		for (const field of REQUIRED_FIELDS) assert.equal(field in effect, true, `${effect.id}.${field}`);
		assert.equal(effect.durationMilliseconds > 0, true);
		assert.equal(effect.tickIntervalMilliseconds >= 0, true);
		assert.equal(effect.maximumStacks >= 1, true);
		assert.equal(Object.isFrozen(effect), true);
		assert.equal(Object.isFrozen(effect.modifiers), true);
	}
});

test('periodic, stacking, cleansing, and boss-resistance definitions remain explicit', () => {
	const enthusiasm = torahStatusEffectDefinition('flame-of-enthusiasm');
	assert.equal(enthusiasm.tickIntervalMilliseconds, 1000);
	assert.equal(enthusiasm.maximumStacks, 3);
	assert.equal(torahStatusEffectDefinition('waters-of-purification').modifiers.cleanseCount, 1);
	assert.equal(torahStatusEffectDefinition('merciful-restraint').bossBehavior, 'immune');
	assert.equal(torahStatusEffectDefinition('missing'), null);
});
