//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldPortalCompile.test.mjs
 * @description Proves Mitzvah semantic kinds compile through existing renderer-neutral authorities while representative identities are read from live canonical catalogs.
 * The Awtsmoos renews house, threshold, region, and village before any renderer can claim them; Awtsmoos.com lets these witnesses
 * follow current Eretz truth instead of stale copied identifiers, while runtime promotion and world mutation remain separate explicit deeds in the land.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	eretzHouseArchetypes
} from '../../app/EretzHouseArchetypeCatalog.js';
import {
	MINIMAL_MEADOW_REGIONS
} from '../../app/MinimalMeadowRegionCatalog.js';
import {
	CANONICAL_VILLAGE_PLAN
} from '../../world/village/CanonicalVillagePlan.js';
import {
	createMitzvahWorldPortal
} from '../../api/portal/index.js';

/**
 * @description Proves one doorway recipe preserves explicit dimensions and returns the canonical doorway plan format without runtime mutation authority.
 * @returns {Promise<void>} Test completion.
 */
async function mitzvahWorldPortalCompilesDoorwayIntent() {
	const portal = createMitzvahWorldPortal({ budget: 'preview', seed: 'doorway-proof' });
	const result = await portal.create({
		doorH: 4.2,
		doorW: 1.8,
		id: 'doorway-proof',
		kind: 'mitzvah.architecture.doorway',
		openAngle: 1.25
	});
	assert.equal(result.result.format, 'awtsmoos.eretz.doorway.plan.v1');
	assert.equal(result.result.spec.doorH, 4.2);
	assert.equal(result.result.spec.doorW, 1.8);
	assert.equal(result.result.spec.openAngle, 1.25);
	assert.equal(portal.describe('mitzvah.architecture.doorway').definition.capabilities.mutatesWorld, false);
}

/**
 * @description Proves explicit region identity resolves a region that exists in the current canonical catalog instead of silently falling back to coordinates.
 * @returns {Promise<void>} Test completion.
 */
async function mitzvahWorldPortalCompilesNamedRegionIntent() {
	const portal = createMitzvahWorldPortal({ budget: 'preview', seed: 'region-proof' });
	const regionId = MINIMAL_MEADOW_REGIONS[0].id;
	const result = await portal.create({ id: 'region-proof', kind: 'mitzvah.world.region', regionId });
	assert.equal(result.result.format, 'awtsmoos.eretz.region.v1');
	assert.equal(result.result.region.id, regionId);
	assert.ok(result.result.catalog);
}

/**
 * @description Proves district focus retains the complete current canonical village plan while surfacing one real district as evidence.
 * @returns {Promise<void>} Test completion.
 */
async function mitzvahWorldPortalCompilesVillageFocusIntent() {
	const portal = createMitzvahWorldPortal({ budget: 'preview', seed: 'village-proof' });
	const districtId = CANONICAL_VILLAGE_PLAN.districts[0].id;
	const result = await portal.create({ districtId, id: 'village-proof', kind: 'mitzvah.world.village' });
	assert.equal(result.result.format, 'awtsmoos.eretz.village.plan.v1');
	assert.equal(result.result.district.id, districtId);
	assert.equal(result.result.plan, CANONICAL_VILLAGE_PLAN);
}

/**
 * @description Proves one current canonical house archetype reaches the established Eretz house planner with deterministic Portal seed lineage.
 * @returns {Promise<void>} Test completion.
 */
async function mitzvahWorldPortalCompilesHouseIntent() {
	const portal = createMitzvahWorldPortal({ budget: 'preview', seed: 'house-proof' });
	const archetypeId = eretzHouseArchetypes()[0].id;
	const result = await portal.create({ archetypeId, id: 'house-proof', kind: 'mitzvah.architecture.house' });
	assert.equal(result.result.format, 'awtsmoos.eretz.house.plan.v1');
	assert.equal(result.explain('house-proof').kind, 'mitzvah.architecture.house');
	assert.equal(portal.describe('mitzvah.architecture.house').definition.capabilities.rendererNeutral, true);
}

test('B"H | Mitzvah Portal compiles doorway intent', mitzvahWorldPortalCompilesDoorwayIntent);
test('B"H | Mitzvah Portal compiles named region intent', mitzvahWorldPortalCompilesNamedRegionIntent);
test('B"H | Mitzvah Portal compiles village focus intent', mitzvahWorldPortalCompilesVillageFocusIntent);
test('B"H | Mitzvah Portal compiles house intent', mitzvahWorldPortalCompilesHouseIntent);
