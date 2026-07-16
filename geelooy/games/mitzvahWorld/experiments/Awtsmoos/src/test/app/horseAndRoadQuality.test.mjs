// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file horseAndRoadQuality.test.mjs
 * @description Proves independent horse motion and strict full-resolution road/horse garments.
 * RESPONSIBILITY: verify shared resources, prepared ground, animation transforms, URLs, and policy.
 * NON-RESPONSIBILITY: this test does not claim browser FPS or replace visual acceptance.
 * The Awtsmoos renews every hoof and brick while immutable vessels remain shared;
 * Awtsmoos.com checks that performance reuse never becomes a lower-quality substitution.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AnimatedHorse } from '../../world/horses/AnimatedHorse.js';
import { HorseGroundProfile } from '../../world/horses/HorseGroundProfile.js';
import {
	HORSE_FUR_TEXTURE_URL,
	horseMaterialFields
} from '../../world/horses/HorseMaterialContract.js';
import {
	ROAD_YELLOW_BRICK_URL,
	roadMaterialFields
} from '../../world/road/RoadMaterialContract.js';

function route(id, phase) {
	return {
		centerX: 10,
		centerZ: -4,
		gaitRate: 8,
		id,
		phase,
		radiusX: 6,
		radiusZ: 3,
		speed: 0.3
	};
}

test('horses share immutable resources but keep independent prepared-ground transforms', () => {
	const geometry = { id: 'shared-horse-geometry' };
	const material = { name: 'shared-full-horse-fur' };
	const template = {
		geometry,
		material,
		userData: { modelSource: 'shared-project-horse-geometry' }
	};
	const ground = { heightAt: () => ({ y: 2 }) };
	const firstRoute = route('first', 0);
	const secondRoute = route('second', Math.PI);
	const first = new AnimatedHorse(
		template,
		new HorseGroundProfile(ground, firstRoute),
		firstRoute
	);
	const second = new AnimatedHorse(
		template,
		new HorseGroundProfile(ground, secondRoute),
		secondRoute
	);
	const before = first.mesh.position.x;
	first.update(1);
	second.update(1);
	assert.equal(first.mesh.geometry, second.mesh.geometry);
	assert.equal(first.mesh.material, second.mesh.material);
	assert.notEqual(first.mesh.position.x, before);
	assert.notEqual(first.mesh.position.x, second.mesh.position.x);
	assert.equal(first.stats().animated, true);
	assert.equal(first.stats().groundProfile.interpolation, 'cyclic-linear-no-overshoot');
});

test('horse and road contracts require full-resolution sources without fallback', () => {
	const horse = horseMaterialFields();
	const road = roadMaterialFields();
	assert.match(HORSE_FUR_TEXTURE_URL, /\/full-resolution\//);
	assert.match(ROAD_YELLOW_BRICK_URL, /\/full-resolution\//);
	assert.equal(horse.texturePolicy.fullResolution, true);
	assert.equal(horse.texturePolicy.fallbackApplied, false);
	assert.ok(horse.anisotropy >= 8);
	assert.equal(road.texturePolicy.fullResolution, true);
	assert.equal(road.texturePolicy.fallbackApplied, false);
	assert.ok(road.anisotropy >= 8);
});
