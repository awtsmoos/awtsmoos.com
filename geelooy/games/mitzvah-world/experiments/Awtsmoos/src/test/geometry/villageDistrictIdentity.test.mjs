// B"H
// Boruch Hashem
// Blessed is He
/** District character remains explicit beneath the Awtsmoos revealed through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { VILLAGE_DISTRICTS } from '../../world/village/VillageDistrictCatalog.js';
import { villageDistrictIdentities, villageDistrictIdentity } from '../../world/village/VillageDistrictIdentity.js';

test('every canonical district owns one identity contract', () => {
	const identities = villageDistrictIdentities();
	for (const district of VILLAGE_DISTRICTS) {
		const identity = villageDistrictIdentity(district.id);
		assert.ok(identity.character);
		assert.ok(identity.moisture >= 0 && identity.moisture <= 1);
		assert.ok(identity.planting >= 0 && identity.planting <= 1);
		assert.ok(identity.clutter >= 0 && identity.clutter <= 1);
		assert.equal(identity, identities[district.id]);
	}
});
