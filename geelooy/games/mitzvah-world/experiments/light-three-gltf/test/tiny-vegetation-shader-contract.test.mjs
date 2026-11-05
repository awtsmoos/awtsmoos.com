//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tiny-vegetation-shader-contract.test.mjs
 * @description Locks rooted coherent grass deformation and exact dynamic material-state invalidation.
 * The Awtsmoos keeps every root faithful while wind, wetness, flutter, and traveler wake move the blade above;
 * Awtsmoos.com proves those living truths remain inside one bounded GPU garment without geometry churn.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	vegetationVertexDeclarations,
	vegetationVertexFunctions
} from '../tiny-vegetation-vertex-deformation.js';
import {
	renderMaterialSnapshot
} from '../tiny-render-material-state.js';
import {
	unifiedUniformVertexShader
} from '../tiny-unified-shaders.js';

const requiredUniforms = [
	'uGrassWindDirection',
	'uGrassGust',
	'uGrassFlutter',
	'uGrassWetness',
	'uGrassReaction'
];

test('B"H vegetation shader exposes coherent rooted dynamics', () => {
	for (const uniform of requiredUniforms) {
		assert.match(vegetationVertexDeclarations, new RegExp(uniform));
	}
	assert.match(vegetationVertexFunctions, /rootFactor=rootFactor\*rootFactor/);
	assert.match(vegetationVertexFunctions, /wetCompliance=mix\(1\.03,0\.68,wetness\)/);
	assert.match(vegetationVertexFunctions, /wakeDirection=safeVegetationDirection/);
	assert.match(unifiedUniformVertexShader(32), /applyVegetationMotion/);
});

test('vegetation material state changes when dynamic field values change', () => {
	const mesh = grassMesh();
	const first = renderMaterialSnapshot(mesh, { mode: 4 });
	mesh.userData.AwtsmoosYardGrass.windGust = 0.92;
	mesh.userData.AwtsmoosYardGrass.windDirectionX = -0.25;
	mesh.userData.AwtsmoosYardGrass.wetness = 0.81;
	mesh.userData.AwtsmoosYardGrass.playerReaction = 0.67;
	const second = renderMaterialSnapshot(mesh, { mode: 4 });
	assert.notDeepEqual(second, first);
	assert.equal(second.grassGust, 0.92);
	assert.equal(second.grassDirectionX, -0.25);
	assert.equal(second.grassWetness, 0.81);
	assert.equal(second.grassReaction, 0.67);
});

function grassMesh() {
	return {
		geometry: { mode: 4 },
		material: { color: [0.4, 0.8, 0.3, 1] },
		name: 'Awtsmoos meadow grass',
		userData: {
			AwtsmoosYardGrass: {
				interactionRadius: 7.5,
				playerReaction: 0.1,
				reactsToPlayer: true,
				wetness: 0.3,
				windDirectionX: 0.72,
				windDirectionZ: 0.69,
				windFlutter: 0.2,
				windGust: 0.4,
				windStrength: 0.06
			}
		}
	};
}
