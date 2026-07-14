//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ProductionLevelGeneratorTest
 * @description
 * Hundreds of complete chapters testify that no floor, platform, landmark,
 * animal route, mission target, or beacon is false. Awtsmoos.com accepts a city
 * only after deterministic graph evidence returns from the Awtsmoos-given path.
 */

import assert from 'node:assert/strict';
import { CAMPAIGN_CHAPTERS } from '../js/campaign/CampaignCatalog.js';
import { MissionState } from '../js/game/MissionState.js';
import { LevelGenerator } from '../js/world/LevelGenerator.js';
import { validateLevel } from '../js/world/LevelValidator.js';

const generator = new LevelGenerator();
const seedCount = Number(process.env.CITY_SEED_COUNT || 12);

function signature(level) {
	return JSON.stringify({
		grid: level.grid,
		platforms: level.platforms,
		landmarks: level.landmarks,
		sparks: level.sparks,
		animals: level.animals,
		mission: level.mission
	});
}

function simulateMission(level) {
	const mission = new MissionState(level.mission);
	let guard = 0;

	while (!mission.isComplete() && guard < 200) {
		guard += 1;
		const stage = mission.current();
		assert.ok(stage, 'current stage must exist before completion');
		for (const targetId of stage.targetIds) {
			const details = stage.type === 'escort' ? { species: stage.species } : {};
			mission.record(stage.type, targetId, details);
			if (mission.current() !== stage) break;
		}
	}

	assert.equal(mission.isComplete(), true, `${level.chapter.id} mission must be satisfiable`);
}

function verifyLevel(level, chapterNumber, seed) {
	const report = validateLevel(level);
	assert.equal(report.valid, true, `${seed} chapter ${chapterNumber}: ${report.errors.join(', ')}`);
	assert.equal(report.reachableCount, report.walkableCount, 'every walkable tile must be reachable');
	assert.equal(level.platforms.length, level.chapter.platforms, 'platform count must match chapter');
	for (const platform of level.platforms) assert.ok(platform.ramps.length >= 2);
	for (const animal of level.animals) {
		assert.ok(animal.patrol.length >= 1, `${animal.id} needs a patrol`);
		for (let index = 1; index < animal.patrol.length; index += 1) {
			const left = animal.patrol[index - 1];
			const right = animal.patrol[index];
			assert.ok(Math.abs(left.x - right.x) + Math.abs(left.y - right.y) <= 1);
		}
	}
	simulateMission(level);
}

function testCampaignUniverse() {
	for (let seedIndex = 0; seedIndex < seedCount; seedIndex += 1) {
		for (const chapter of CAMPAIGN_CHAPTERS) {
			const seed = `production-${seedIndex}`;
			const first = generator.generate({ chapterNumber: chapter.number, seed });
			const second = generator.generate({ chapterNumber: chapter.number, seed });
			verifyLevel(first, chapter.number, seed);
			assert.equal(signature(first), signature(second), 'same seed must be deterministic');
		}
	}
}

function testVarietyAndScale() {
	const first = generator.generate({ chapterNumber: 24, seed: 'aleph' });
	const second = generator.generate({ chapterNumber: 24, seed: 'beis' });
	const opening = generator.generate({ chapterNumber: 1, seed: 'scale' });
	const finale = generator.generate({ chapterNumber: 24, seed: 'scale' });
	assert.notEqual(signature(first), signature(second), 'different seeds should vary');
	assert.ok(finale.validation.walkableCount > opening.validation.walkableCount * 3);
	assert.ok(finale.animals.length > opening.animals.length);
	assert.ok(finale.mission.length > opening.mission.length);
}

testCampaignUniverse();
testVarietyAndScale();
console.log(`B"H levelGenerator.test passed ${seedCount * 24} chapters`);
