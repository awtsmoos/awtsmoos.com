// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityCatalog.test.mjs @description Verifies complete canonical ability schemas. */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	TORAH_ABILITY_CATALOG,
	torahAbilityDefinition,
	torahAbilityForPassage
} from '../../gameplay/combat/TorahAbilityCatalog.js';

const REQUIRED_FIELDS = Object.freeze([
	'audioEvent', 'castMilliseconds', 'castType', 'channelMilliseconds', 'chargeRecoveryMilliseconds',
	'charges', 'cooldownMilliseconds', 'damage', 'description', 'globalCooldownMilliseconds', 'healing',
	'id', 'passageId', 'questTags', 'radius', 'range', 'resourceCost', 'school', 'shield', 'stagger',
	'statusEffects', 'targetType', 'title', 'unlockCondition', 'visualEvent'
]);

test('every Torah ability has a complete immutable action schema', () => {
	assert.equal(TORAH_ABILITY_CATALOG.length, 9);
	assert.equal(new Set(TORAH_ABILITY_CATALOG.map(item => item.id)).size, TORAH_ABILITY_CATALOG.length);
	for (const ability of TORAH_ABILITY_CATALOG) {
		for (const field of REQUIRED_FIELDS) assert.equal(field in ability, true, `${ability.id}.${field}`);
		assert.equal(Object.isFrozen(ability), true);
		assert.equal(Object.isFrozen(ability.statusEffects), true);
		assert.equal(ability.unlockCondition.passageId, ability.passageId);
	}
});

test('catalog resolves both stable ability and learned passage identities', () => {
	assert.equal(torahAbilityDefinition('shield-of-trust').passageId, 'guardian-path');
	assert.equal(torahAbilityForPassage('living-water').id, 'waters-of-purification');
	assert.equal(torahAbilityDefinition('missing'), null);
	assert.equal(torahAbilityForPassage('missing'), null);
});

test('catalog includes instant, cast, channel, charged, and reactive timelines', () => {
	const castTypes = new Set(TORAH_ABILITY_CATALOG.map(item => item.castType));
	for (const castType of ['instant', 'cast', 'channel', 'charged', 'reactive']) {
		assert.equal(castTypes.has(castType), true, castType);
	}
});
