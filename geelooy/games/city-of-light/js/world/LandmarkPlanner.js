//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LandmarkPlanner
 * @description
 * Missions become real only when their shrines, stones, echoes, sanctuaries,
 * checkpoints, and sparks occupy proven streets. The Awtsmoos.com planner binds
 * authored intention to reachable geometry beneath the one Awtsmoos.
 */

import { keyOf, walkablePoints } from './GridPathfinder.js';

function countFor(chapter, stageType) {
	return chapter.stages
		.filter(stage => stage.type === stageType)
		.reduce((total, stage) => total + stage.count, 0);
}

function createPool(grid, distances, random, reserved) {
	return random.shuffle(walkablePoints(grid))
		.filter(point => (distances.get(keyOf(point)) || 0) >= 4)
		.sort((left, right) => {
			return (distances.get(keyOf(right)) || 0) - (distances.get(keyOf(left)) || 0);
		})
		.filter(point => !reserved.has(keyOf(point)));
}

function takeSpread(pool, reserved, minimumSeparation = 2) {
	const index = pool.findIndex(point => {
		return [...reserved].every(existingKey => {
			const [x, y] = existingKey.split(',').map(Number);
			return Math.abs(point.x - x) + Math.abs(point.y - y) >= minimumSeparation;
		});
	});
	const safeIndex = index >= 0 ? index : 0;
	const [point] = pool.splice(safeIndex, 1);
	if (point) reserved.add(keyOf(point));
	return point;
}

function addLandmarks(landmarks, pool, reserved, type, count, properties = {}) {
	for (let index = 0; index < count; index += 1) {
		const point = takeSpread(pool, reserved);
		if (!point) break;
		landmarks.push({
			id: `${type}-${landmarks.filter(item => item.type === type).length + 1}`,
			type,
			...point,
			...properties,
			order: index
		});
	}
}

export function planLandmarks(options) {
	const reserved = new Set([keyOf(options.spawn), keyOf(options.exit)]);
	const pool = createPool(options.grid, options.distances, options.random, reserved);
	const landmarks = [{ id: 'exit', type: 'exit', ...options.exit, active: false }];
	addLandmarks(landmarks, pool, reserved, 'shrine', countFor(options.chapter, 'awaken'));
	addLandmarks(landmarks, pool, reserved, 'bridgeStone', countFor(options.chapter, 'bridge'));
	addLandmarks(landmarks, pool, reserved, 'echo', countFor(options.chapter, 'sequence'));
	addLandmarks(landmarks, pool, reserved, 'checkpoint', countFor(options.chapter, 'checkpoint'));
	const escortStages = options.chapter.stages.filter(stage => stage.type === 'escort');
	addLandmarks(landmarks, pool, reserved, 'sanctuary', escortStages.length);
	addLandmarks(landmarks, pool, reserved, 'cache', Math.max(1, Math.floor(options.chapter.number / 6)));

	return {
		landmarks,
		reserved,
		pool
	};
}

export function planSparks(pool, reserved, count) {
	const sparks = [];

	for (let index = 0; index < count; index += 1) {
		const point = takeSpread(pool, reserved, 1);
		if (!point) break;
		sparks.push({ id: `spark-${index + 1}`, ...point });
	}

	return sparks;
}
