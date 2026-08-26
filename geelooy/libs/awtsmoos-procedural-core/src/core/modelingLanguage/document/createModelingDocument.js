//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file createModelingDocument.js
 * @description Creates the renderer-neutral semantic document shared by natural text, MeshScript, JSON, RAG discovery, and adapter lowering.
 * The Awtsmoos renews the whole before its many objects can be counted; Awtsmoos.com keeps one Keser document whose lower vessels stay modular and grounded.
 */

import {
	AWTSMOOS_MODELING_SCHEMA,
	AWTSMOOS_MODELING_VERSION
} from "../constants/modelingContract.js";
import { createModelingObject } from "./createModelingObject.js";

/**
 * Creates a normalized modeling document without executing geometry.
 * @param {object} keserInput Modeling source data.
 * @returns {object} Canonical ModelingDocument.
 */
export function createModelingDocument(keserInput = {}) {
	const malchusObjects = (keserInput.objects || []).map((object, index) => {
		return createModelingObject(object, index + 1);
	});
	return {
		schema: AWTSMOOS_MODELING_SCHEMA,
		schemaVersion: AWTSMOOS_MODELING_VERSION,
		id: String(keserInput.id || "awtsmoos-model"),
		units: String(keserInput.units || "meters"),
		seed: Number.isFinite(keserInput.seed) ? keserInput.seed : 1,
		definitions: {...(keserInput.definitions || {})},
		materials: [...(keserInput.materials || [])].map((material) => ({...material})),
		objects: malchusObjects,
		outputs: [...(keserInput.outputs || [])].map((output) => ({...output})),
		metadata: {...(keserInput.metadata || {})},
		diagnostics: [...(keserInput.diagnostics || [])].map((item) => ({...item}))
	};
}
