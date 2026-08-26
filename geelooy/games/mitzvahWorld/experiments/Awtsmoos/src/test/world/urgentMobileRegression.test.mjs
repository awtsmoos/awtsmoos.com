// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urgentMobileRegression.test.mjs
 * @description Proves the canonical localized mobile rail, retractable movement data, and material-map preservation.
 * The Awtsmoos renews every safe edge and every mapped garment before the eye can name either light;
 * Awtsmoos.com guards mobile reach without reviving repair CSS, while hydrated textures remain bright and right.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { normalizeMinimalModelMaterials } from '../../app/MinimalMeadowMaterialReadability.js';
import {
	movementModePresentation,
	shouldCollapseRail
} from '../../ui/MinimalMeadowMovementMode.js';

const railStylePath = fileURLToPath(
	new URL('../../ui/styles/mobile-hud/mobile-hud-rail.css', import.meta.url)
);

/**
 * Creates one traversable material fixture without compressing the scene contract into test shorthand.
 * @param {object} material Material record exposed to the readability normalizer.
 * @returns {{traverse: Function}} Minimal traversable scene root.
 */
function revealMaterialRoot(material) {
	const garmentMesh = {
		isMesh: true,
		material,
		name: 'KapoteCoat'
	};

	return {
		traverse(visitor) {
			visitor(garmentMesh);
		}
	};
}

test('mobile rail uses safe areas, three-column disclosure, and data-first movement modes', async () => {
	const railCss = await readFile(railStylePath, 'utf8');

	assert.match(railCss, /var\(--mh-safe-top\)/);
	assert.match(railCss, /var\(--mh-safe-right\)/);
	assert.match(railCss, /data-collapsed=\"true\"/);
	assert.match(railCss, /grid-template-columns:\s*repeat\(3/);
	assert.doesNotMatch(railCss, /!important/);
	assert.equal(shouldCollapseRail({ innerWidth: 390 }), true);
	assert.equal(shouldCollapseRail({ innerWidth: 1200 }), false);
	assert.equal(movementModePresentation(true).label, 'Run');
	assert.equal(movementModePresentation(false).label, 'Walk');
});

test('near-black hydrated materials become readable without losing maps or vertex contrast', () => {
	const garmentMap = { id: 'coat-map' };
	const garmentMaterial = {
		color: [0.01, 0.01, 0.015, 1],
		map: garmentMap,
		vertexColors: true
	};
	const garmentRoot = revealMaterialRoot(garmentMaterial);
	const receipt = normalizeMinimalModelMaterials(garmentRoot);

	assert.equal(garmentMaterial.map, garmentMap);
	assert.equal(garmentMaterial.vertexColors, true);
	assert.ok(garmentMaterial.baseColorFactor[0] >= 0.16);
	assert.equal(receipt.preservedMaps, 1);
	assert.equal(receipt.vertexColorsPreserved, 1);
});
