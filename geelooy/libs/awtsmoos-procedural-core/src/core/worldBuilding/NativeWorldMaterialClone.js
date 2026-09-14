//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file NativeWorldMaterialClone.js
 * @description Clones renderer-native physical materials without returning constructor ownership to products.
 * Callers may need independent garment, actor, or world surfaces before mutating color or semantic metadata;
 * Core preserves renderer fields and shared remote image references while copying mutable metadata vessels.
 */

import {
	MeshStandardMaterial
} from '../../adapters/native/runtime.js';

/**
 * Creates one independent native material from an existing renderer material.
 * Texture/image objects remain shared intentionally; arrays and metadata objects that products commonly mutate
 * are copied so actor-specific tint, repeat, policy, or evidence cannot leak back into the canonical source.
 * @param {object|null} source Existing native material to isolate.
 * @param {{name?:string,userData?:object}} options Optional identity and additional evidence.
 * @returns {object|null} Independent native material, or the original nullish value.
 */export function cloneNativeWorldMaterial(source, options = {}) {
	if (!source) {
		return source;
	}
	const clone = Object.assign(
		new MeshStandardMaterial(source),
		source
	);
	clone.name = options.name || source.name || 'Awtsmoos Core Material Clone';
	clone.color = copyArray(source.color);
	clone.baseColorFactor = copyArray(source.baseColorFactor);
	clone.mapRepeat = copyArray(source.mapRepeat);
	clone.mixRepeat = copyArray(source.mixRepeat);
	clone.texturePolicy = source.texturePolicy
		? { ...source.texturePolicy }
		: source.texturePolicy;
	clone.userData = {
		...(source.userData || {}),
		...(options.userData || {})
	};
	clone.textureLayers = copyLayers(source.textureLayers);
	return clone;
}

/** Copies a mutable array while preserving non-array renderer values by reference. */
function copyArray(value) {
	return Array.isArray(value) ? [...value] : value;
}

/** Copies mutable layer records while retaining heavyweight image references. */
function copyLayers(value) {
	if (!Array.isArray(value)) {
		return value;
	}
	return value.map((layer) => {
		return { ...layer };
	});
}
