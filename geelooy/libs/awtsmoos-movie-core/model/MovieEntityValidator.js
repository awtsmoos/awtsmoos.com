//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieEntityValidator.js
 * @description Each entity is a keli and the Awtsmoos renews its name, motion, and form in measured light;
 * Awtsmoos.com keeps those vessels distinct so the renderer can reveal their purpose without losing sight.
 */
import { MOVIE_FEATURES } from "./MovieFeatureCatalog.js";
import { validateEntityTrack } from "./MovieTrackValidator.js";

/**
 * @description Validates a scene's optional entity collection.
 * @param {object} scene - Canonical scene object.
 * @param {number} sceneDuration - Duration of the containing scene in seconds.
 * @param {string} scenePath - Human-readable canonical document path for diagnostics.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied ledgers.
 */
export function validateSceneEntities(scene, sceneDuration, scenePath, errors, warnings) {
	if (scene.entities != null && !Array.isArray(scene.entities)) {
		errors.push(`${scenePath}.entities must be an array when provided.`);
		return;
	}
	const entityIds = new Set();
	for (const [index, entity] of (scene.entities || []).entries()) {
		validateEntity(
			entity,
			sceneDuration,
			`${scenePath}.entities[${index}]`,
			scenePath,
			entityIds,
			errors,
			warnings
		);
	}
}

/**
 * @description Validates one entity's identity, type, and optional animation tracks.
 * @param {object} entity - Canonical entity object.
 * @param {number} sceneDuration - Duration of the containing scene in seconds.
 * @param {string} entityPath - Human-readable canonical document path for diagnostics.
 * @param {string} scenePath - Human-readable path of the containing scene.
 * @param {Set<string>} entityIds - Scene-local entity identifier registry.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Mutates the entity identifier registry and validation ledgers.
 */
function validateEntity(
	entity,
	sceneDuration,
	entityPath,
	scenePath,
	entityIds,
	errors,
	warnings
) {
	if (!entity || typeof entity !== "object" || Array.isArray(entity)) {
		errors.push(`${entityPath} must be an object.`);
		return;
	}
	const entityId = typeof entity.id === "string" ? entity.id.trim() : "";
	if (!entityId) {
		errors.push(`${entityPath}.id must be a non-empty string.`);
	} else if (entityIds.has(entityId)) {
		errors.push(`${scenePath} repeats entity id ${entityId}.`);
	} else {
		entityIds.add(entityId);
	}
	if (!MOVIE_FEATURES.entities.includes(entity.type)) {
		warnings.push(`${entityPath} uses custom type ${entity.type}.`);
	}
	validateTracks(entity, sceneDuration, entityPath, errors, warnings);
}

/**
 * @description Validates the optional track collection for one entity.
 * @param {object} entity - Canonical entity object.
 * @param {number} sceneDuration - Duration of the containing scene in seconds.
 * @param {string} entityPath - Human-readable canonical document path for diagnostics.
 * @param {string[]} errors - Mutable validation error ledger.
 * @param {string[]} warnings - Mutable validation warning ledger.
 * @returns {void}
 * @sideEffects Appends validation findings to the supplied ledgers.
 */
function validateTracks(entity, sceneDuration, entityPath, errors, warnings) {
	if (entity.tracks != null && !Array.isArray(entity.tracks)) {
		errors.push(`${entityPath}.tracks must be an array when provided.`);
		return;
	}
	for (const [index, track] of (entity.tracks || []).entries()) {
		validateEntityTrack(
			track,
			sceneDuration,
			`${entityPath}.tracks[${index}]`,
			errors,
			warnings
		);
	}
}
