// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBotanicalMotion.test.mjs
 * @description Proves rooted ecology-driven tree motion and deterministic species-aware meadow geometry.
 * The Awtsmoos keeps roots still while crown, blade, and blossom move in measured light;
 * Awtsmoos.com verifies species wind, varied abundance, petal truth, and stable geometry remain right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { animateMinimalMeadowTree } from '../../app/MinimalMeadowTreeWind.js';
import { createMinimalMeadowFlowerCellGeometry } from '../../app/MinimalMeadowFlowerClumpGeometry.js';

function treeVessel() {
	return {
		children: [{ quaternion: { x: 0, z: 0 } }, { quaternion: { x: 0, z: 0 } }],
		position: { x: 2, y: 4, z: 3 },
		quaternion: { z: 0 },
		userData: {
			AwtsmoosTree: { windPhase: 0.4 },
			AwtsmoosTreeEcology: {
				canopyDensity: 1.18,
				ecologyZone: 'dry-upland',
				role: 'windbreak',
				windPhase: 0.7,
				windSpeed: 0.74,
				windStrength: 0.0062
			}
		}
	};
}

function botanicalGeometry(seed = 0) {
	return createMinimalMeadowFlowerCellGeometry({
		center: { x: 0, y: 0, z: 0 },
		clumps: 2,
		seed,
		terrain: { heightAt: () => 0 }
	});
}

test('B"H species wind moves canopy more than bark while root remains fixed', () => {
	const tree = treeVessel();
	const before = { ...tree.position };
	const evidence = animateMinimalMeadowTree(tree, 2.3, 1, { x: 2, z: 3 });
	assert.deepEqual(tree.position, before);
	assert.equal(evidence.rootRotation, 0);
	assert.ok(evidence.canopySway > evidence.trunkSway);
	assert.ok(evidence.playerPulse > 0);
	assert.equal(evidence.windSpeed, 0.74);
	assert.equal(evidence.windStrength, 0.0062);
	assert.equal(evidence.ecologyZone, 'dry-upland');
	assert.equal(evidence.role, 'windbreak');
});

test('B"H species-aware clumps preserve deterministic abundance and petal truth', () => {
	const first = botanicalGeometry(613);
	const repeated = botanicalGeometry(613);
	const alternate = botanicalGeometry(614);
	assert.deepEqual(first, repeated);
	assert.ok(first.flowers >= first.clumps * 2);
	assert.ok(first.flowers <= first.clumps * 5);
	assert.equal(first.petals.faces.length, first.flowers * first.petalCount);
	assert.equal(first.grass.uvs.length, first.grass.faces.length * 8);
	assert.notDeepEqual(first.grass.vertices, alternate.grass.vertices);
});
