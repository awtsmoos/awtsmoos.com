//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class LevelGenerator
 * @description
 * A production chapter is assembled through one accountable pipeline: authored
 * mission, connected streets, loops, plazas, platforms, landmarks, sparks,
 * animals, binding, and judgment. Only then may Awtsmoos.com call it a city.
 */

import {
	chapterByNumber,
	chapterPresentation
} from '../campaign/CampaignCatalog.js';
import { planAnimals } from '../wildlife/AnimalPlanner.js';
import { repairConnectivity } from './ConnectivityRepair.js';
import {
	distancesFrom,
	farthestPoints,
	keyOf
} from './GridPathfinder.js';
import { planLandmarks, planSparks } from './LandmarkPlanner.js';
import { carveMaze, openLoops, openPlazas } from './MazeCarver.js';
import { planMission } from './MissionPlanner.js';
import { planPlatforms } from './PlatformPlanner.js';
import { SeededRandom } from './SeededRandom.js';
import { validateLevel } from './LevelValidator.js';

export class LevelGenerator {
	/**
	 * Generates one deterministic campaign chapter.
	 *
	 * @param {Object} options Chapter number and external seed.
	 * @returns {Object} Fully validated level data.
	 */
	generate({ chapterNumber = 1, seed = 'city-of-light' } = {}) {
		const chapter = chapterPresentation(chapterByNumber(chapterNumber));
		const worldSeed = `${seed}:chapter:${chapter.number}:${chapter.id}`;
		const random = new SeededRandom(worldSeed);
		const grid = carveMaze(chapter.width, chapter.height, random);
		openLoops(grid, chapter.loops, random);
		openPlazas(grid, chapter.plazas, random);
		const connectivity = repairConnectivity(grid);
		const spawn = { x: 1, y: 1 };
		const distances = distancesFrom(grid, spawn);
		const exit = farthestPoints(distances, 1, new Set([keyOf(spawn)]))[0];
		const reserved = new Set([keyOf(spawn), keyOf(exit)]);
		const platforms = planPlatforms(grid, chapter.platforms, random, reserved);
		platforms.flatMap(platform => platform.cells).forEach(point => reserved.add(keyOf(point)));
		const planned = planLandmarks({
			grid,
			distances,
			random,
			chapter,
			spawn,
			exit
		});
		const sparks = planSparks(planned.pool, planned.reserved, chapter.sparks);
		const animals = planAnimals({
			grid,
			chapter,
			random,
			reserved: planned.reserved
		});
		const mission = planMission(chapter, {
			landmarks: planned.landmarks,
			platforms,
			sparks
		});
		const level = {
			seed: worldSeed,
			chapter,
			grid,
			spawn,
			exit,
			platforms,
			landmarks: planned.landmarks,
			sparks,
			animals,
			mission,
			width: chapter.width,
			height: chapter.height,
			theme: chapter.theme,
			weather: chapter.weather,
			connectivity
		};
		const validation = validateLevel(level);
		if (!validation.valid) {
			throw new Error(`Invalid City of Light chapter: ${validation.errors.join(', ')}`);
		}
		return { ...level, validation };
	}
}
