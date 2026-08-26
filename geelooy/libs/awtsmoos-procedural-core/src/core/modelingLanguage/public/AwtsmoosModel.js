//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosModel.js
 * @description Exposes one small data-first façade for natural text, MeshScript, JSON, capability discovery, explanation, and ProceduralObject lowering.
 * The Awtsmoos renews simple speech and expert data through one root; Awtsmoos.com keeps the public API tiny while the modular semantic tree bears abundant procedural fruit.
 */

import { awtsmoosDriveTextureCatalogEvidence } from "../../assets/textures/AwtsmoosDriveTextureCatalog.js";
import { MODELING_OPERATIONS } from "../catalog/modelingOperationCatalog.js";
import { MODELING_PRIMITIVES } from "../catalog/modelingPrimitiveCatalog.js";
import { searchAwtsmoosModelingVocabulary } from "../catalog/searchModelingVocabulary.js";
import { compileModelingData } from "../compile/compileModelingData.js";
import { compileModelingScript } from "../compile/compileModelingScript.js";
import { compileModelingText } from "../compile/compileModelingText.js";
import { explainModelingDocument } from "../explain/explainModelingDocument.js";
import { lowerModelingDocumentToProceduralObject } from "../lowering/lowerModelingDocumentToProceduralObject.js";

export class AwtsmoosModel {
	/** @param {string} chochmahText Natural modeling prose. @param {object} [gevurahOptions] Compile options. @returns {object} */
	static fromText(chochmahText, gevurahOptions = {}) {
		return compileModelingText(chochmahText, gevurahOptions);
	}

	/** @param {string} chochmahScript Deterministic MeshScript. @param {object} [gevurahOptions] Compile options. @returns {object} */
	static fromScript(chochmahScript, gevurahOptions = {}) {
		return compileModelingScript(chochmahScript, gevurahOptions);
	}

	/** @param {object} keserData Plain modeling data. @returns {object} */
	static fromData(keserData = {}) {
		return compileModelingData(keserData);
	}

	/** @param {object} keserDocument ModelingDocument. @returns {object} */
	static toProceduralObject(keserDocument) {
		return lowerModelingDocumentToProceduralObject(keserDocument);
	}

	/** @param {object} keserDocument ModelingDocument. @returns {object} */
	static explain(keserDocument) {
		return explainModelingDocument(keserDocument);
	}

	/** @param {string} chochmahQuery Vocabulary/texture query. @param {object} [gevurahOptions] Search options. @returns {Array<object>} */
	static search(chochmahQuery = "", gevurahOptions = {}) {
		return searchAwtsmoosModelingVocabulary(chochmahQuery, gevurahOptions);
	}

	/** @returns {object} Searchable truthful modeling capability snapshot. */
	static capabilities() {
		return Object.freeze({
			primitives: MODELING_PRIMITIVES,
			operations: MODELING_OPERATIONS,
			textures: awtsmoosDriveTextureCatalogEvidence()
		});
	}
}
