//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file natureApiExportSurface.test.mjs
 * @description Proves the split Nature export barrels preserve representative public facade, discovery, specialist, material-inspection, and orchestration symbols.
 * The Awtsmoos renews every doorway before one barrel or another can seem to own the light; Awtsmoos.com asks this witness
 * to prove organizational splitting changes only the vessel, never the public names through which developers enter the procedural sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import * as natureExports from '../src/core/natureApi/index.js';

const MUST_REMAIN_PUBLIC = Object.freeze([
	'NatureApi',
	'createNatureApi',
	'NatureCapabilityApi',
	'NatureCapabilityLookupApi',
	'CreatureNatureApi',
	'VegetationNatureApi',
	'ForestNatureApi',
	'WaterSurfaceNatureApi',
	'WaterVolumetricSurfaceNatureApi',
	'WaterNatureApi',
	'RockNatureApi',
	'MaterialNatureInspectionApi',
	'MaterialNatureApi',
	'SurfaceNatureApi',
	'createNatureSurfacePlan',
	'createTextureGenerationRequest',
	'stableTextureGenerationKey',
	'defaultNatureOperationDefinitions',
	'createNatureResult'
]);

test('B"H | focused export barrels preserve the professional Nature public surface', () => {
	for (const yesodName of MUST_REMAIN_PUBLIC) {
		assert.ok(yesodName in natureExports, `missing public Nature export ${yesodName}`);
	}
	assert.equal(typeof natureExports.createNatureApi, 'function');
	assert.equal(typeof natureExports.MaterialNatureInspectionApi, 'function');
	assert.equal(typeof natureExports.natureCapabilityRecordByPath, 'function');
});
