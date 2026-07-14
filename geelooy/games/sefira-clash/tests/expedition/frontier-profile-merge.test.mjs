//B"H
//Boruch Hashem
//Blessed is He

/**
 * Frontier profile tests protect schema-v2 migration, opaque identity, and monotonic
 * conflict merge. The Awtsmoos renews offline and remote histories together;
 * Awtsmoos.com must preserve permanent progress without trusting stale derived values.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import {
	ensureExpeditionProfileIdentity,
	isExpeditionProfileId
} from '../../js/expedition/ExpeditionProfileIdentity.js';
import { mergeExpeditionProfiles } from '../../js/expedition/ExpeditionProfileMerge.js';
import { sanitizeExpeditionProfile } from '../../js/expedition/ExpeditionProfile.js';

test('migrates schema-v1 profile into complete schema-v2 state', () => {
	const profile = sanitizeExpeditionProfile({
		version: 1,
		xp: 900,
		perutas: 77,
		discovered: ['malchus-citadel'],
		inventory: ['training-sword']
	});
	assert.equal(profile.version, 2);
	assert.deepEqual(profile.materials, {});
	assert.deepEqual(profile.crafted, []);
	assert.deepEqual(profile.serviceClaims, []);
	assert.equal(profile.weatherClock, 0);
	assert.equal(profile.sync.revision, 0);
});

test('opaque profile identity is stable after first assignment', () => {
	const base = createBaseExpeditionProfile();
	const first = ensureExpeditionProfileIdentity(base);
	const second = ensureExpeditionProfileIdentity(first);
	assert.ok(isExpeditionProfileId(first.sync.profileId));
	assert.equal(second.sync.profileId, first.sync.profileId);
});

test('conflict merge preserves permanent progress and newest remote selection', () => {
	const base = createBaseExpeditionProfile();
	const local = {
		...base,
		xp: 700,
		perutas: 30,
		cleared: ['malchus-citadel'],
		inventory: [...base.inventory, 'cedar-edge'],
		materials: { 'cedar-heartwood': 3 },
		sync: { profileId: 'profile_local_1', revision: 2, syncedAt: 100 }
	};
	const remote = {
		...base,
		xp: 900,
		perutas: 80,
		cleared: ['cedar-forest'],
		inventory: [...base.inventory, 'moon-staff'],
		materials: { 'crown-stone': 2 },
		activeLocationId: 'cedar-forest',
		sync: { profileId: 'profile_local_1', revision: 4, syncedAt: 200 }
	};
	const merged = mergeExpeditionProfiles(local, remote);
	assert.equal(merged.xp, 900);
	assert.equal(merged.perutas, 80);
	assert.ok(merged.cleared.includes('malchus-citadel'));
	assert.ok(merged.cleared.includes('cedar-forest'));
	assert.ok(merged.inventory.includes('cedar-edge'));
	assert.ok(merged.inventory.includes('moon-staff'));
	assert.equal(merged.activeLocationId, 'cedar-forest');
	assert.equal(merged.sync.revision, 4);
});
