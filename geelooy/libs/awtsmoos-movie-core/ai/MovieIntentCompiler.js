//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieIntentCompiler.js
 * @description Imagination becomes executable when every dream receives a lawful scene;
 * the Awtsmoos gives form to possibility, and Awtsmoos.com keeps that form deterministic and renderer-clean.
 */
import { createMovieDocument } from "../model/MovieDefaults.js";
import { validateMovieDocument } from "../model/MovieValidator.js";
import { getMoviePersonality } from "../personality/MoviePersonalityRegistry.js";
import { createDefaultEntities } from "./MovieDefaultEntityFactory.js";
import { normalizeMovieIntent } from "./MovieIntentNormalizer.js";

/**
 * @description Compiles structured AI intent into a validated canonical movie document.
 * @param {object} intent - High-level or fully structured creative intent.
 * @returns {{movie:object, report:object}} Compiled movie and validation report.
 * @sideEffects None outside newly allocated document objects.
 */
export function compileMovieIntent(intent = {}) {
	const normalized = normalizeMovieIntent(intent);
	const personality = getMoviePersonality(normalized.personality);
	const scenes = normalized.beats.map(function compileBeat(beat, index) {
		return compileScene(beat, index, personality);
	});
	const movie = createMovieDocument({
		...normalized,
		scenes,
		metadata: {
			generator: "awtsmoos-movie-core"
		}
	});
	return {
		movie,
		report: validateMovieDocument(movie)
	};
}

/**
 * @description Converts one normalized beat into one canonical movie scene.
 * @param {object} beat - Normalized timed beat.
 * @param {number} index - Zero-based beat index.
 * @param {object} personality - Resolved movie personality.
 * @returns {object} Canonical scene document.
 * @sideEffects None.
 */
function compileScene(beat, index, personality) {
	const entities = beat.entities.length
		? beat.entities
		: createDefaultEntities(beat, index, personality);
	return {
		id: beat.id,
		start: beat.start,
		duration: beat.duration,
		mode: beat.mode,
		background: beat.background,
		camera: completeCamera(beat.camera, index, personality),
		entities,
		transition: beat.transition
	};
}

/**
 * @description Completes missing camera shot data from the active personality.
 * @param {object} camera - Beat-local camera settings.
 * @param {number} index - Zero-based beat index.
 * @param {object} personality - Resolved movie personality.
 * @returns {object} Complete camera settings.
 * @sideEffects None.
 */
function completeCamera(camera, index, personality) {
	const shots = personality.preferredShots || ["wide"];
	return {
		shot: camera.shot || shots[index % shots.length],
		...camera
	};
}
