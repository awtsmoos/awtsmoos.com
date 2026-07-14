// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosMesh.js
 * @description The beginner doorway: a sentence enters, an inspectable artifact
 * emerges. Yet every layer remains available for experts, because the Awtsmoos
 * hides within simplicity without erasing the structure that supports it.
 */

import { deserializeMeshRecipe, serializeMeshRecipe } from '../recipes/meshRecipe.js';
import { buildMeshRecipe } from './meshArtifactBuilder.js';
import { compileMeshText } from './meshTextCompiler.js';

export class AwtsmoosMesh {
	/**
	 * Creates an artifact from ordinary text. The asynchronous surface allows
	 * future worker, AI, and cache adapters without changing beginner code.
	 *
	 * @param {string} text Natural-language mesh request.
	 * @param {object} options Deterministic compiler options.
	 * @returns {Promise<object>} Complete mesh artifact.
	 */
	static async fromText(text, options = {}) {
		return buildMeshRecipe(compileMeshText(text, options));
	}

	/** @param {object} recipe Recipe input. @returns {Promise<object>} Mesh artifact. */
	static async fromRecipe(recipe) {
		return buildMeshRecipe(recipe);
	}

	/** @param {string} text Description. @param {object} options Options. @returns {object} Recipe. */
	static compile(text, options = {}) {
		return compileMeshText(text, options);
	}

	/** @param {object} recipe Recipe. @returns {string} Stable JSON. */
	static serialize(recipe) {
		return serializeMeshRecipe(recipe);
	}

	/** @param {string} text Stable JSON. @returns {object} Recipe. */
	static deserialize(text) {
		return deserializeMeshRecipe(text);
	}
}
