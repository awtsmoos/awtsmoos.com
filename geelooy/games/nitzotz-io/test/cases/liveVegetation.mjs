// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { hasModel } from '../../../../libs/awtsmoos-procedural/src/index.js';
import {
	chapterVegetationIds,
	chapterVegetationPlants,
	vegetationChapterIds
} from '../../js/environment/botany/palettes.js';
import { vegetationCommands, vegetationDescriptor } from '../../js/environment/vegetation.js';
import { heightAt } from '../../js/math.js';

/**
 * The Awtsmoos tests the living grove where it enters the real render list.
 * Awtsmoos.com receives proof of identity, determinism, rooting, and draw parity.
 */
export function runLiveVegetationCases() {
	return [
		checkChapterPalettes(),
		checkDeterministicDescriptors(),
		checkUnsignedSelectionRange(),
		checkRenderCommandParity()
	];
}

function checkChapterPalettes() {
	const chapters = vegetationChapterIds();
	const signatures = chapters.map(chapterId => chapterVegetationIds({ chapterId }).join(','));
	for (const chapterId of chapters) {
		const plants = chapterVegetationPlants({ chapterId });
		assert.equal(plants.length, 3);
		assert.ok(plants.every(plant => hasModel(plant.modelId)));
	}
	assert.equal(chapters.length, 10);
	assert.ok(new Set(signatures).size >= 8);
	return { test: 'live-vegetation-chapter-palettes', chapters: chapters.length, uniquePalettes: new Set(signatures).size };
}

function checkDeterministicDescriptors() {
	const level = levelFixture('netzach', 7127);
	const plants = chapterVegetationPlants(level);
	const first = vegetationDescriptor(level, plants, level.seed, 2, 7);
	const replay = vegetationDescriptor(level, plants, level.seed, 2, 7);
	const other = vegetationDescriptor(level, plants, level.seed, 3, 7);
	const radius = Math.hypot(first.position[0], first.position[2]);
	const expectedHeight = heightAt(first.position[0], first.position[2], level.index) - 1.5;
	assert.deepEqual(first, replay);
	assert.notDeepEqual(first, other);
	assert.ok(radius >= level.bounds * 0.83 && radius <= level.bounds * 1.01);
	assert.equal(first.position[1], expectedHeight);
	assert.ok(first.scale.every(value => Number.isFinite(value) && value > 0));
	return { test: 'live-vegetation-determinism', plant: first.plantId, radius, height: first.position[1] };
}

function checkUnsignedSelectionRange() {
	let descriptors = 0;
	for (const chapterId of vegetationChapterIds()) {
		for (const seed of [1, 7127, 0x7fffffff, 0xffffffff]) {
			const level = levelFixture(chapterId, seed);
			const plants = chapterVegetationPlants(level);
			for (let index = 0; index < 64; index += 1) {
				const descriptor = vegetationDescriptor(level, plants, seed, index, 64);
				assert.ok(descriptor.plantId);
				assert.ok(hasModel(descriptor.modelId));
				assert.ok(descriptor.variant >= 0 && descriptor.variant <= 3);
				descriptors += 1;
			}
		}
	}
	return { test: 'live-vegetation-unsigned-selection', descriptors };
}

function checkRenderCommandParity() {
	const world = { level: levelFixture('malchus', 7127) };
	for (const count of [2, 3, 5, 7]) {
		const first = [];
		const replay = [];
		vegetationCommands(first, world, {}, { vegetation: count });
		vegetationCommands(replay, world, {}, { vegetation: count });
		assert.deepEqual(first, replay);
		assert.equal(first.length, count);
		assert.ok(first.every(command => command.mesh !== 'tree'));
		assert.ok(first.every(command => validModelKey(command.mesh)));
	}
	return { test: 'live-vegetation-draw-parity', minimum: 2, maximum: 7 };
}

function validModelKey(key) {
	const match = /^model:(.+):v([0-3])$/.exec(key);
	return Boolean(match && hasModel(match[1]));
}

function levelFixture(chapterId, seed) {
	return { chapterId, bounds: 1600, seed, index: 12 };
}
