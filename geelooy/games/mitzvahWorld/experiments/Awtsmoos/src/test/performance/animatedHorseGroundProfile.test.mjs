// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animatedHorseGroundProfile.test.mjs
 * @description Proves full-frame horse motion preserves form while terrain queries remain zero.
 * The Awtsmoos renews gait, face, and place each instant; Awtsmoos.com tests that living
 * movement remains continuous after the mountain contour has been faithfully prepared once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { AnimatedHorse } from '../../world/horses/AnimatedHorse.js';
import {
	HorseGroundProfile,
	HORSE_GROUND_SAMPLE_COUNT
} from '../../world/horses/HorseGroundProfile.js';
import { HorseHerdSystem } from '../../world/horses/HorseHerdSystem.js';
import { sharedHorseTemplate } from '../../world/horses/HorseGeometryTemplate.js';
import { HORSE_HERD_ROUTES } from '../../world/horses/HorseRouteCatalog.js';
import { terrainHeightAt } from '../../world/TerrainGeometry.js';

function countedTerrain() {
	return {
		calls: 0,
		heightAt(x, z) {
			this.calls += 1;
			return terrainHeightAt(x, z);
		}
	};
}

test('animated horse preserves analytic movement and shared render resources', () => {
	const route = HORSE_HERD_ROUTES[0];
	const ground = countedTerrain();
	const profile = new HorseGroundProfile(ground, route);
	const template = sharedHorseTemplate();
	const horse = new AnimatedHorse(template, profile, route);
	const constructionQueries = ground.calls;
	for (let index = 0; index < 1200; index += 1) {
		horse.update(1 / 60);
	}
	const angle = route.phase + horse.clock * route.speed;
	const expectedX = route.centerX + Math.cos(angle) * route.radiusX;
	const expectedZ = route.centerZ + Math.sin(angle) * route.radiusZ;
	const directionX = -Math.sin(angle) * route.radiusX;
	const directionZ = Math.cos(angle) * route.radiusZ;
	const yaw = Math.atan2(directionX, directionZ);
	const expectedY = profile.heightAt(angle)
		+ Math.abs(Math.sin(horse.clock * route.gaitRate)) * 0.075;
	assert.ok(Math.abs(horse.mesh.position.x - expectedX) < 1e-12);
	assert.ok(Math.abs(horse.mesh.position.y - expectedY) < 1e-12);
	assert.ok(Math.abs(horse.mesh.position.z - expectedZ) < 1e-12);
	assert.ok(Math.abs(horse.mesh.quaternion.y - Math.sin(yaw / 2)) < 1e-12);
	assert.ok(Math.abs(horse.mesh.quaternion.w - Math.cos(yaw / 2)) < 1e-12);
	assert.equal(horse.mesh.geometry, template.geometry);
	assert.equal(horse.mesh.material, template.material);
	assert.equal(ground.calls, constructionQueries);
	assert.equal(constructionQueries, HORSE_GROUND_SAMPLE_COUNT);
	assert.equal(horse.stats().groundProfile.sampleCount, HORSE_GROUND_SAMPLE_COUNT);
});

test('complete herd performs only one-time terrain preparation', () => {
	const scene = new Group();
	const ground = countedTerrain();
	const herd = new HorseHerdSystem(scene, ground);
	const constructionQueries = ground.calls;
	for (let index = 0; index < 1000; index += 1) {
		herd.update(1 / 60);
	}
	const stats = herd.stats();
	assert.equal(herd.horses.length, 3);
	assert.equal(herd.group.children.length, 3);
	assert.equal(constructionQueries, HORSE_GROUND_SAMPLE_COUNT * 3);
	assert.equal(ground.calls, constructionQueries);
	assert.equal(stats.terrainQueriesDuringConstruction, constructionQueries);
	assert.equal(stats.runtimeTerrainQueries, 0);
	assert.equal(stats.allAnimated, true);
	assert.equal(stats.drawVessels, 3);
});
