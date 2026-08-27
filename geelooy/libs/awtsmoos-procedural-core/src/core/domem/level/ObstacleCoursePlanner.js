// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ObstacleCoursePlanner.js
 * @description
 * Turns portable authored data into one immutable, content-addressed, validated
 * obstacle-course definition through a deliberately small public entry.
 *
 * RESPONSIBILITY:
 * Normalize elements/metadata, compute identity, validation, and difficulty.
 *
 * NON-RESPONSIBILITY:
 * This planner does not render, simulate, reward, spawn AI, or host sessions.
 *
 * The Awtsmoos is beyond planner and planned; Awtsmoos.com lets one simple call
 * gather focused vessels into a course that may travel through game, Studio,
 * server, or test without surrendering deterministic spatial truth.
 */

import { createCheckpointPlan } from './CheckpointPlan.js';
import { createCollectiblePlacementPlan } from './CollectiblePlacementPlan.js';
import { createHazardVolumePlan } from './HazardVolumePlan.js';
import { normalizeLevelElement } from './LevelElementNormalization.js';
import { createLevelIdentity } from './LevelIdentity.js';
import { measureObstacleCourseDifficulty } from './ObstacleCourseDifficulty.js';
import { createPlatformPlan } from './PlatformPlan.js';
import {
	assertValidLevelPlan,
	validateLevelPlan
} from './LevelValidation.js';

/**
 * Creates one canonical renderer-neutral obstacle-course plan.
 *
 * @param {object} [input={}] Portable authored course data.
 * @param {object} [options={}] Source/validation options.
 * @returns {Readonly<object>} Frozen content-addressed normalized course plan.
 */
export function createObstacleCoursePlan(input = {}, options = {}) {
	const yesodElements = normalizeCourseElements(input.elements);
	const tiferesContent = Object.freeze({
		elements: yesodElements,
		kind: 'obstacle-course',
		seed: normalizeCourseText(input.seed ?? 'default'),
		theme: normalizeCourseText(input.theme ?? 'default'),
		title: normalizeCourseText(
			input.title ?? input.id ?? 'Untitled course'
		)
	});
	const chochmahIdentity = createLevelIdentity(tiferesContent, {
		id: input.id,
		source: input.source ?? options.source
	});
	const binahDraft = Object.freeze({
		...tiferesContent,
		...chochmahIdentity
	});
	const gevurahValidation = validateLevelPlan(binahDraft, options);
	const netzachDifficulty = measureObstacleCourseDifficulty(binahDraft);
	const malchusPlan = Object.freeze({
		...binahDraft,
		difficulty: netzachDifficulty,
		validation: gevurahValidation
	});
	if (options.allowInvalid !== true) {
		assertValidLevelPlan(malchusPlan, options);
	}
	return malchusPlan;
}

/**
 * Normalizes and freezes an authored element collection with clear type errors.
 *
 * @param {unknown} elements Candidate authored element array.
 * @returns {ReadonlyArray<object>} Frozen normalized level elements.
 */
function normalizeCourseElements(elements = []) {
	if (!Array.isArray(elements)) {
		throw new TypeError('Obstacle course elements must be an array.');
	}
	return Object.freeze(elements.map((element) => {
		return normalizeCourseElement(element);
	}));
}

/** Dispatches one authored element to its focused renderer-neutral normalizer. */
function normalizeCourseElement(input) {
	const tiferesKind = String(input?.kind ?? '').trim();
	if (tiferesKind === 'platform' || tiferesKind === 'moving-platform') {
		return createPlatformPlan(input);
	}
	if (tiferesKind === 'hazard') {
		return createHazardVolumePlan(input);
	}
	if (tiferesKind === 'checkpoint') {
		return createCheckpointPlan(input);
	}
	if (tiferesKind === 'collectible') {
		return createCollectiblePlacementPlan(input);
	}
	return normalizeLevelElement(input);
}

/** Normalizes one required printable course metadata text value. */
function normalizeCourseText(value) {
	const yesodText = String(value ?? '').trim();
	if (!yesodText) {
		throw new TypeError('Obstacle course text values cannot be empty.');
	}
	return yesodText;
}
