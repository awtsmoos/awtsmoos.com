// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowBotanicalMotion.test.mjs
 * @description Proves rooted tree motion and deterministic multicolor botanical communities.
 * The Awtsmoos keeps roots still while crown, blade, and blossom move in measured light;
 * Awtsmoos.com verifies wind, abundance, palette truth, and stable geometry remain right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowFlowerCellGeometry } from '../../app/MinimalMeadowFlowerClumpGeometry.js';
import { selectMinimalMeadowFlowerCommunity } from '../../app/MinimalMeadowFlowerSpecies.js';
import { animateMinimalMeadowTree } from '../../app/MinimalMeadowTreeWind.js';

function treeVessel() {
	return {
		children: [{ quaternion: { x: 0, z: 0 } }, { quaternion: { x: 0, z: 0 } }],
		position: { x: 2, y: 4, z: 3 },
		quaternion: { z: 0 },
		userData: {
			AwtsmoosTree: { windPhase: 0.4 },
			AwtsmoosTreeEcology: {
				canopyDensity: 1.18, ecologyZone: 'dry-upland', role: 'windbreak',
				windPhase: 0.7, windSpeed: 0.74, windStrength: 0.0062
			}
		}
	};
}

function botanicalGeometry(seed = 0) {
	const ecology = { flowerDensity: 0.8, zone: 'mixed-meadow' };
	const community = selectMinimalMeadowFlowerCommunity(ecology, 0.31);
	return createMinimalMeadowFlowerCellGeometry({
		center: { x: 0, y: 0, z: 0 },
		clumps: 3,
		grassColor: '#568f3c',
		seed,
		species: community[0],
		speciesCommunity: community,
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

test('B"H mixed clumps preserve deterministic abundance and palette truth', () => {
	const first = botanicalGeometry(613);
	const repeated = botanicalGeometry(613);
	const alternate = botanicalGeometry(614);
	assert.deepEqual(first, repeated);
	assert.ok(first.flowers >= first.clumps * 2);
	assert.ok(first.flowers <= first.clumps * 5);
	assert.ok(first.speciesIds.length >= 2);
	assert.equal(first.grass.uvs.length, first.grass.faces.length * 8);
	assert.equal(first.petals.colors.length, first.petals.vertices.length);
	assert.ok(new Set(first.petals.colors.map(color => color.join(','))).size >= 3);
	assert.notDeepEqual(first.grass.vertices, alternate.grass.vertices);
});
