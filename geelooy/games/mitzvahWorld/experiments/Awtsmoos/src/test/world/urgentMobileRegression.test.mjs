// B"H
// Boruch Hashem
// Blessed is He

/** @file urgentMobileRegression.test.mjs @description Proves safe-area CSS and material-map preservation. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mobileCss } from '../../ui/MobileRegressionStyles.js';
import { movementModePresentation, shouldCollapseRail } from '../../ui/MinimalMeadowGameRail.js';
import { normalizeMinimalModelMaterials } from '../../app/MinimalMeadowMaterialReadability.js';
test('mobile CSS protects all safe areas and collapses secondary rail actions', () => {
	const css = mobileCss();
	assert.match(css, /safe-area-inset-top/);
	assert.match(css, /safe-area-inset-bottom/);
	assert.match(css, /safe-area-inset-right/);
	assert.match(css, /data-collapsed="true"/);
	assert.match(css, /grid-template-columns: repeat\(3/);
	assert.equal(shouldCollapseRail({ innerWidth: 390 }), true);
	assert.equal(shouldCollapseRail({ innerWidth: 1200 }), false);
	assert.equal(movementModePresentation(true).label, 'Run');
	assert.equal(movementModePresentation(false).label, 'Walk');
});
test('near-black hydrated materials become readable without losing maps or vertex contrast', () => {
	const map = { id: 'coat-map' };
	const material = { color: [0.01, 0.01, 0.015, 1], map, vertexColors: true };
	const mesh = { isMesh: true, material, name: 'KapoteCoat' };
	const root = { traverse(visitor) { visitor(mesh); } };
	const receipt = normalizeMinimalModelMaterials(root);
	assert.equal(material.map, map);
	assert.equal(material.vertexColors, true);
	assert.ok(material.baseColorFactor[0] >= 0.16);
	assert.equal(receipt.preservedMaps, 1);
	assert.equal(receipt.vertexColorsPreserved, 1);
});
