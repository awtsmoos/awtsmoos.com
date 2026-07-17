// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_ARTIFACT_SCHEMA
} from "../constants/proceduralObjectContract.js";
import {
	createDataBlockArtifact
} from "./createDataBlockArtifact.js";
import {
	createDataLinkArtifact
} from "./createDataLinkArtifact.js";
import {
	freezeArtifactValue
} from "./freezeArtifactValue.js";
import {
	createGeometryArtifact
} from "./createGeometryArtifact.js";
import {
	createObjectArtifact
} from "./createObjectArtifact.js";

function normalizeRecord(values, creator) {
	return Object.freeze(Object.fromEntries(
		Object.entries(values || {}).map(([id, value]) => [
			id,
			creator({
				id,
				...value
			})
		])
	));
}

/**
 * Creates one complete renderer-neutral procedural result.
 *
 * @param {object} input Artifact declaration.
 * @returns {object} Frozen procedural artifact.
 */
export function createProceduralArtifact(input = {}) {
	return Object.freeze({
		schema: PROCEDURAL_OBJECT_ARTIFACT_SCHEMA,
		schema_version: input.schema_version || "1.0.0",
		recipe_id: input.recipe_id || null,
		geometries: normalizeRecord(
			input.geometries,
			createGeometryArtifact
		),
		objects: normalizeRecord(input.objects, createObjectArtifact),
		rootObjectIds: freezeArtifactValue(input.rootObjectIds || []),
		materials: freezeArtifactValue(input.materials || {}),
		dataBlocks: normalizeRecord(
			input.dataBlocks || input.data_blocks,
			createDataBlockArtifact
		),
		links: Object.freeze(
			[...(input.links || [])].map(createDataLinkArtifact)
		),
		armatures: freezeArtifactValue(input.armatures || {}),
		animations: freezeArtifactValue(input.animations || {}),
		definitions: freezeArtifactValue(input.definitions || {}),
		deferredCommands: freezeArtifactValue(input.deferredCommands || []),
		diagnostics: freezeArtifactValue(input.diagnostics || []),
		metadata: freezeArtifactValue(input.metadata || {})
	});
}
