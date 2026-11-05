//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldPortalSchema.test.mjs
 * @description Proves Mitzvah World semantic kinds expose truthful typed inspector data derived from canonical architecture and region catalogs.
 * The Awtsmoos renews field and catalog before either can drift apart; Awtsmoos.com lets these witnesses keep generated UI choices
 * bound to real Eretz data while Core remains the single Portal vocabulary and no game-specific panel invents a second schema language.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	PORTAL_FIELD_KINDS,
	createProceduralPortal
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
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

const MITZVAH_KINDS = Object.freeze([
	'mitzvah.architecture.house',
	'mitzvah.architecture.doorway',
	'mitzvah.world.region',
	'mitzvah.world.village'
]);

/**
 * @description Proves every Mitzvah semantic kind exposes non-empty fields using only Core-supported renderer-neutral field kinds.
 * @returns {void}
 */
function mitzvahWorldPortalSchemasExposeSupportedFields() {
	const portal = createMitzvahWorldPortal({ budget: 'preview' });
	for (const kind of MITZVAH_KINDS) {
		const fields = portal.describe(kind).inspector.groups.flatMap(group => group.fields);
		assert.ok(fields.length > 0, `${kind} should expose inspector fields`);
		for (const field of fields) {
			assert.ok(PORTAL_FIELD_KINDS.includes(field.kind), `${kind}:${field.key}:${field.kind}`);
		}
	}
}

/**
 * @description Proves select options are derived from the exact canonical house, region, and village catalogs rather than duplicated UI constants.
 * @returns {void}
 */
function mitzvahWorldPortalSelectOptionsMatchCanonicalCatalogs() {
	const portal = createMitzvahWorldPortal({ budget: 'preview' });
	const house = fieldByKey(portal, 'mitzvah.architecture.house', 'archetypeId');
	const region = fieldByKey(portal, 'mitzvah.world.region', 'regionId');
	const village = fieldByKey(portal, 'mitzvah.world.village', 'districtId');
	assert.deepEqual(house.options, eretzHouseArchetypes().map(value => value.id));
	assert.deepEqual(region.options, MINIMAL_MEADOW_REGIONS.map(value => value.id));
	assert.deepEqual(village.options, CANONICAL_VILLAGE_PLAN.districts.map(value => value.id));
}

/**
 * @description Proves installing Mitzvah-specific semantic kinds does not mutate a separately created Core default Portal registry.
 * @returns {void}
 */
function mitzvahWorldPortalExtensionsRemainInstanceLocal() {
	const core = createProceduralPortal({ budget: 'preview' });
	const mitzvah = createMitzvahWorldPortal({ budget: 'preview' });
	assert.equal(core.registry.has('mitzvah.architecture.house'), false);
	assert.equal(mitzvah.registry.has('mitzvah.architecture.house'), true);
}

/**
 * @description Finds one field from the generated inspector schema by canonical recipe/options key.
 * @param {object} portal Mitzvah World Portal facade.
 * @param {string} kind Canonical semantic kind.
 * @param {string} key Field key to locate.
 * @returns {Readonly<object>} Matching immutable field descriptor.
 */
function fieldByKey(portal, kind, key) {
	const fields = portal.describe(kind).inspector.groups.flatMap(group => group.fields);
	const field = fields.find(candidate => candidate.key === key);
	assert.ok(field, `Expected ${kind} to expose ${key}`);
	return field;
}

test('B"H | Mitzvah Portal schemas expose supported Core fields', mitzvahWorldPortalSchemasExposeSupportedFields);
test('B"H | Mitzvah Portal select options match canonical catalogs', mitzvahWorldPortalSelectOptionsMatchCanonicalCatalogs);
test('B"H | Mitzvah Portal extensions remain instance-local', mitzvahWorldPortalExtensionsRemainInstanceLocal);
