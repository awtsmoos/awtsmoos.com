//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralMovieGateway.js
 * @description The Awtsmoos binds story, time, and generated form without confusing their role;
 * Awtsmoos.com gives every studio one AI-facing gateway into the procedural whole.
 */

import {
	compileMovieIntent,
	describeMovieFeatures,
	evaluateMovieAt,
	validateMovieDocument
} from "./MovieCoreBridge.js";
import {
	MOVIE_ASSET_TYPES,
	generateMovieAsset
} from "../movieAssets/index.js";
import {
	describeNativeMovieAssets,
	generateNativeMovieAsset,
	loadNativeMovieAssetSystem
} from "./NativeMovieAssetRegistry.js";

/**
 * Coordinates canonical movie authoring with portable and native procedural generation.
 */
export class ProceduralMovieGateway {
	/**
	 * Returns the vocabulary AI may safely request from the shared movie system.
	 *
	 * @returns {object} Movie, portable-asset, and native-asset capabilities.
	 */
	describeCapabilities() {
		return {
			movie: describeMovieFeatures(),
			portableAssetTypes: [...MOVIE_ASSET_TYPES],
			nativeAssetSystems: describeNativeMovieAssets()
		};
	}

	/** @param {object} intent High-level movie intent. */
	compile(intent = {}) {
		return compileMovieIntent(intent);
	}

	/** @param {object} movie Canonical movie document. */
	validate(movie) {
		return validateMovieDocument(movie);
	}

	/** @param {object} movie Canonical movie document. @param {number} seconds Movie time. */
	evaluate(movie, seconds) {
		return evaluateMovieAt(movie, seconds);
	}

	/** @param {object} recipe Renderer-neutral procedural asset recipe. */
	generatePortableAsset(recipe) {
		return generateMovieAsset(recipe);
	}

	/**
	 * Executes a real procedural-core factory where the native registry proves one exists.
	 *
	 * @param {string} id Native system identifier.
	 * @param {...unknown} args Native factory arguments.
	 */
	async generateNativeAsset(id, ...args) {
		return generateNativeMovieAsset(id, ...args);
	}

	/** @param {string} id Native system identifier. */
	async loadNativeSystem(id) {
		return loadNativeMovieAssetSystem(id);
	}
}

/** @returns {ProceduralMovieGateway} Shared gateway with no hidden mutable global state. */
export function createProceduralMovieGateway() {
	return new ProceduralMovieGateway();
}
