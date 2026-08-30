//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEntityEvaluator.js
 * @description The Awtsmoos reveals one entity at one local instant while every animated channel finds its proper vessel;
 * Awtsmoos.com keeps path mutation separate from scene selection, so timeline law remains clear and level.
 */
import { evaluateKeyframes } from "./MovieInterpolator.js";

/**
 * @description Evaluates all scene entities at one local scene time.
 * @param {Array<object>} entities - Canonical scene entities.
 * @param {number} localTime - Local scene time in seconds.
 * @returns {object[]} Detached evaluated entities.
 * @sideEffects None outside newly allocated entity clones.
 */
export function evaluateSceneEntities(entities, localTime) {
	const evaluatedEntities = [];
	for (const entity of entities || []) {
		evaluatedEntities.push(evaluateEntity(entity, localTime));
	}
	return evaluatedEntities;
}

/**
 * @description Evaluates one entity's animation tracks against local scene time.
 * @param {object} entity - Canonical entity with optional animation tracks.
 * @param {number} localTime - Local scene time in seconds.
 * @returns {object} Detached evaluated entity without track definitions.
 * @sideEffects None outside the detached entity clone.
 */
function evaluateEntity(entity, localTime) {
	const evaluated = structuredClone(entity);
	delete evaluated.tracks;
	for (const track of entity.tracks || []) {
		const value = evaluateKeyframes(track.keyframes, localTime);
		if (value !== undefined) {
			setPath(evaluated, track.target, value);
		}
	}
	return evaluated;
}

/**
 * @description Assigns one evaluated track value into a dotted property path.
 * @param {object} target - Detached entity receiving the evaluated value.
 * @param {string} path - Dotted property path such as transform.rotation.
 * @param {*} value - Evaluated track value.
 * @returns {void}
 * @sideEffects Mutates the supplied detached target object.
 */
function setPath(target, path, value) {
	const segments = String(path || "").split(".").filter(Boolean);
	if (segments.length === 0) {
		return;
	}
	let vessel = target;
	for (let index = 0; index < segments.length - 1; index += 1) {
		const segment = segments[index];
		if (!vessel[segment] || typeof vessel[segment] !== "object") {
			vessel[segment] = {};
		}
		vessel = vessel[segment];
	}
	vessel[segments.at(-1)] = value;
}
