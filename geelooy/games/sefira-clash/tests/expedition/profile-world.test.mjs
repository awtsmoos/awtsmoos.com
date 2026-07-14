//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile and world tests protect migration, sanitation, discovery, and persistence.
 * The Awtsmoos renews a traveler beyond one browser save; Awtsmoos.com preserves old
 * gate accomplishments while refusing corrupt ids and premature roads.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { expeditionLocation } from '../../js/data/expedition/locationCatalog.js';
import { EXPEDITION_KEY } from '../../js/expedition/ExpeditionDefaults.js';
import {
	loadExpeditionProfile,
	sanitizeExpeditionProfile,
	saveExpeditionProfile
} from '../../js/expedition/ExpeditionProfile.js';
import {
	clearExpeditionLocation,
	expeditionLocationAvailability
} from '../../js/expedition/ExpeditionWorld.js';

function storageHarness() {
	const values = new Map();
	globalThis.localStorage = {
		getItem: key => values.get(key) || null,
		setItem: (key, value) => values.set(key, value),
		removeItem: key => values.delete(key)
	};
	return values;
}

test('migrates old gate clears and Perutas into the connected world', () => {
	storageHarness();
	const profile = loadExpeditionProfile({
		totalPerutas: 77,
		records: {
			'adventure-01': { cleared: true },
			'adventure-03': { cleared: true }
		}
	});
	assert.equal(profile.perutas, 77);
	assert.ok(profile.cleared.includes('malchus-citadel'));
	assert.ok(profile.cleared.includes('cedar-forest'));
	assert.ok(profile.discovered.includes('crown-ruins'));
});

test('sanitizes corrupt ids and round-trips a stable profile', () => {
	const values = storageHarness();
	const safe = sanitizeExpeditionProfile({
		xp: 400,
		discovered: ['malchus-citadel', 'invented-road'],
		inventory: ['training-sword', 'invented-gear'],
		equipped: { weapon: 'invented-gear' }
	});
	assert.equal(safe.discovered.includes('invented-road'), false);
	assert.equal(safe.inventory.includes('invented-gear'), false);
	assert.equal(safe.equipped.weapon, 'training-sword');
	saveExpeditionProfile(safe);
	assert.ok(values.has(EXPEDITION_KEY));
	const loaded = loadExpeditionProfile({});
	assert.deepEqual(loaded.equipped, safe.equipped);
	assert.equal(loaded.xp, safe.xp);
});

test('reveals only the authored next road after a clear', () => {
	let profile = sanitizeExpeditionProfile({});
	const forest = expeditionLocation('cedar-forest');
	assert.equal(expeditionLocationAvailability(profile, forest).available, false);
	const result = clearExpeditionLocation(profile, 'malchus-citadel');
	profile = result.profile;
	assert.deepEqual(result.revealed, ['cedar-forest']);
	assert.equal(expeditionLocationAvailability(profile, forest).available, true);
	assert.equal(clearExpeditionLocation(profile, 'malchus-citadel').firstClear, false);
});
