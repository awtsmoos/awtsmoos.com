// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageMaterialDiagnostics.test.mjs
 * @description Proves real cottage readiness while masks and text avoid false alarms.
 * The Awtsmoos clothes each physical witness with truth; Awtsmoos.com distinguishes stone
 * from a URL-only promise and exempts intentional shadows, data masks, and procedural letters.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { inspectVillageMaterials } from '../../diagnostics/VillageMaterialDiagnostics.js';

test('material census reports ready and unresolved cottage surfaces', () => {
	const root = scene([
		mesh('cottage-wall-ready', 'reference-village-district', {
			color: [0.94, 0.92, 0.88, 1],
			mapImage: image(1024, 512),
			textureUrl: 'https://materials.test/stone.png'
		}),
		mesh('cottage-roof-pending', 'reference-village-cottage-roof', {
			color: [1, 1, 1, 1],
			mapImage: null,
			textureUrl: 'https://materials.test/slate.png'
		})
	]);
	const result = inspectVillageMaterials(root);
	assert.equal(result.summary.cottageSurfaces, 2);
	assert.equal(result.summary.cottageReady, 1);
	assert.equal(result.summary.cottagePending, 1);
	assert.equal(result.summary.whiteUntextured, 1);
	assert.equal(result.unresolved[0].mesh, 'cottage-roof-pending');
	assert.equal(result.unresolved[0].reason, 'image-not-ready');
});

test('missing physical URL is named rather than silently treated as texture', () => {
	const result = inspectVillageMaterials(scene([
		mesh('house-foundation', 'functional-house', {
			color: [1, 1, 1, 1],
			texturePolicy: { nativeTexelDensity: true }
		})
	]));
	assert.equal(result.summary.missingTextureUrls, 1);
	assert.equal(result.unresolved[0].reason, 'missing-http-texture-url');
});

test('cottage shadows and procedural text are explicit diagnostic exemptions', () => {
	const result = inspectVillageMaterials(scene([
		mesh('reference-cottage-sun-shadows', 'reference-cottage-sun-shadows', {
			color: [1, 1, 1, 1],
			textureUrl: 'data:image/svg+xml,%3Csvg%3E%3C/svg%3E'
		}),
		mesh('procedural-text-landmark', 'village-static-props', {
			color: [1, 1, 1, 1]
		})
	]));
	assert.equal(result.summary.exemptSurfaces, 2);
	assert.equal(result.summary.cottagePending, 0);
	assert.equal(result.summary.pendingPhysicalMaps, 0);
	assert.equal(result.summary.whiteUntextured, 0);
	assert.deepEqual(result.unresolved, []);
});

function scene(objects) {
	return { traverse: callback => objects.forEach(callback) };
}

function mesh(name, family, material) {
	return { material, name, userData: { family }, visible: true };
}

function image(width, height) {
	return { complete: true, naturalHeight: height, naturalWidth: width };
}
