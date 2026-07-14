//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WildlifeTest
 * @description
 * Living geometry must remain finite, deterministic, path-aware, callable, and
 * shelterable. These witnesses ensure Awtsmoos.com animals never clip through
 * broken routes while the Awtsmoos animates their distinct rhythms.
 */

import assert from 'node:assert/strict';
import { WildlifeSystem } from '../js/wildlife/WildlifeSystem.js';
import { LevelGenerator } from '../js/world/LevelGenerator.js';
import { isWalkable } from '../js/world/GridPathfinder.js';

function testDeterministicMotion() {
	const level = new LevelGenerator().generate({ chapterNumber: 22, seed: 'wildlife-motion' });
	const first = new WildlifeSystem(level.animals);
	const second = new WildlifeSystem(level.animals);
	const player = { x: level.spawn.x, y: level.spawn.y };

	for (let frame = 0; frame < 900; frame += 1) {
		first.update(1 / 60, player, level.grid, []);
		second.update(1 / 60, player, level.grid, []);
	}

	assert.deepEqual(first.snapshot(), second.snapshot());
	for (const animal of first.animals) {
		assert.equal(Number.isFinite(animal.x), true);
		assert.equal(Number.isFinite(animal.y), true);
		if (animal.species !== 'firefly') {
			assert.equal(isWalkable(level.grid, Math.round(animal.x), Math.round(animal.y)), true);
		}
	}
}

function testCallAndSanctuary() {
	const level = new LevelGenerator().generate({ chapterNumber: 8, seed: 'wildlife-call' });
	const system = new WildlifeSystem(level.animals);
	const deer = system.animals.find(animal => animal.species === 'deer');
	const sanctuary = level.landmarks.find(item => item.type === 'sanctuary');
	assert.ok(deer);
	assert.ok(sanctuary);
	const player = { x: deer.x, y: deer.y };
	assert.ok(system.callNearby(player, 1.2, 'deer') >= 1);
	deer.x = sanctuary.x;
	deer.y = sanctuary.y;
	const sheltered = system.update(1 / 60, player, level.grid, [sanctuary]);
	assert.equal(sheltered.some(event => event.animalId === deer.id), true);
	assert.equal(deer.sheltered, true);
}

function testSpeciesPopulation() {
	const level = new LevelGenerator().generate({ chapterNumber: 24, seed: 'wildlife-finale' });
	const counts = {};
	for (const animal of level.animals) counts[animal.species] = (counts[animal.species] || 0) + 1;
	assert.deepEqual(counts, level.chapter.wildlife);
	assert.ok(Object.keys(counts).length >= 5);
}

testDeterministicMotion();
testCallAndSanctuary();
testSpeciesPopulation();
console.log('B"H wildlife.test passed');
