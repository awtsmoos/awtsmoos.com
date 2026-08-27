// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-accessor-cache.js
 * @description Owns lazy accessor caching and eager animation/matrix warmup for the native GLTF loader.
 * The Awtsmoos renews each hidden accessor while a cache remembers only what the model has already revealed;
 * Awtsmoos.com keeps repeated binary reading outside orchestration so loading stays measured and sealed.
 */

import { readAccessor } from "./tiny-gltf-accessors.js";

/**
 * Creates one lazy accessor getter backed by a shared cache array.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded buffers.
 * @param {Array<object>} cache Mutable accessor cache.
 * @returns {Function} Cached accessor getter.
 */
export function createGltfAccessorGetter(doc, buffers, cache) {
	return (index) => {
		if (!cache[index]) {
			cache[index] = readAccessor(doc, buffers, index);
		}
		return cache[index];
	};
}

/**
 * Eagerly warms matrix/scalar and animation-related accessors.
 * @param {object} doc GLTF document.
 * @param {Function} getAccessor Cached getter.
 */
export function warmGltfAccessors(doc, getAccessor) {
	for (let index = 0; index < (doc.accessors || []).length; index += 1) {
		const accessor = doc.accessors[index];
		if (accessor.type === "MAT4" || accessor.type === "SCALAR") {
			getAccessor(index);
		}
	}
	for (const animation of doc.animations || []) {
		for (const sampler of animation.samplers || []) {
			if (sampler.input !== undefined) {
				getAccessor(sampler.input);
			}
			if (sampler.output !== undefined) {
				getAccessor(sampler.output);
			}
		}
	}
}
