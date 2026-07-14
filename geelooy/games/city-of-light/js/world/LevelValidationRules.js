//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LevelValidationRules
 * @description
 * Each rule examines one kind of vessel: platforms, landmarks, animals, or
 * mission bindings. Their separate testimony lets Awtsmoos.com explain exactly
 * why a city was rejected instead of hiding failure beneath the Awtsmoos's light.
 */

import { keyOf } from './GridPathfinder.js';

function reachable(point, reachableKeys) {
	return point && reachableKeys.has(keyOf(point));
}

export function validatePointCollections(level, reachableKeys, errors) {
	const collections = [
		['spark', level.sparks],
		['landmark', level.landmarks]
	];

	for (const [label, collection] of collections) {
		for (const item of collection || []) {
			if (!reachable(item, reachableKeys)) errors.push(`unreachable-${label}:${item.id}`);
		}
	}
}

export function validatePlatforms(level, reachableKeys, errors) {
	if (level.platforms.length < level.chapter.platforms) {
		errors.push(`missing-platforms:${level.platforms.length}/${level.chapter.platforms}`);
	}

	for (const platform of level.platforms) {
		if (platform.ramps.length < 2) errors.push(`platform-without-two-ramps:${platform.id}`);
		for (const cell of platform.cells) {
			if (!reachable(cell, reachableKeys)) errors.push(`unreachable-platform-cell:${platform.id}`);
		}
		for (const ramp of platform.ramps) {
			if (!reachable(ramp, reachableKeys)) errors.push(`unreachable-platform-ramp:${platform.id}`);
		}
	}
}

export function validateAnimals(level, reachableKeys, errors) {
	const counts = {};

	for (const animal of level.animals || []) {
		counts[animal.species] = (counts[animal.species] || 0) + 1;
		if (!reachable(animal.start, reachableKeys)) errors.push(`unreachable-animal:${animal.id}`);
		if (!animal.patrol?.length) errors.push(`missing-patrol:${animal.id}`);

		for (let index = 0; index < (animal.patrol || []).length; index += 1) {
			const point = animal.patrol[index];
			if (!reachable(point, reachableKeys)) errors.push(`unreachable-patrol:${animal.id}`);
			const previous = animal.patrol[index - 1];
			if (previous && Math.abs(point.x - previous.x) + Math.abs(point.y - previous.y) > 1) {
				errors.push(`broken-patrol-step:${animal.id}`);
			}
		}
	}

	for (const [species, requiredCount] of Object.entries(level.chapter.wildlife)) {
		if ((counts[species] || 0) !== requiredCount) {
			errors.push(`wildlife-count:${species}:${counts[species] || 0}/${requiredCount}`);
		}
	}
}

export function validateMission(level, errors) {
	const knownIds = new Set([
		...level.sparks.map(item => item.id),
		...level.landmarks.map(item => item.id),
		...level.platforms.map(item => item.id)
	]);

	for (const stage of level.mission || []) {
		if (!stage.targetIds.length) errors.push(`stage-without-targets:${stage.id}`);
		for (const targetId of stage.targetIds) {
			if (!knownIds.has(targetId)) errors.push(`unknown-stage-target:${stage.id}:${targetId}`);
		}
		if (stage.type !== 'escort' && stage.targetIds.length < stage.requiredCount) {
			errors.push(`insufficient-stage-targets:${stage.id}`);
		}
	}
}
