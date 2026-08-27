// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	normalizeComponentArray
} from "./componentTypes.js";
import {
	freezeArtifactValue
} from "./freezeArtifactValue.js";

/**
 * Creates one arbitrary vertex, corner, instance, face, or custom attribute.
 *
 * Portable layout metadata supports conventional, interleaved, instanced, and
 * future GPU buffers without binding recipes to WebGL or another renderer.
 *
 * @param {object} input Attribute declaration.
 * @returns {object} Frozen attribute artifact.
 */
export function createAttributeArtifact(input = {}) {
	const itemSize = Number(input.itemSize ?? input.item_size ?? 1);
	if (!Number.isInteger(itemSize) || itemSize < 1 || itemSize > 16) {
		throw new Error('B"H | Attribute itemSize must be an integer from 1 to 16.');
	}
	const componentType = input.componentType
		?? input.component_type
		?? "float32";
	const array = normalizeComponentArray(componentType, input.array || []);
	if (array.length % itemSize !== 0) {
		throw new Error('B"H | Attribute array length must divide by itemSize.');
	}
	return Object.freeze({
		itemSize,
		componentType,
		normalized: input.normalized === true,
		domain: input.domain || "vertex",
		usage: input.usage || "static",
		semantic: input.semantic || null,
		count: array.length / itemSize,
		divisor: Number(input.divisor || 0),
		bufferView: input.bufferView ?? input.buffer_view ?? null,
		byteOffset: Number(input.byteOffset ?? input.byte_offset ?? 0),
		byteStride: Number(input.byteStride ?? input.byte_stride ?? 0),
		gpuFormat: input.gpuFormat ?? input.gpu_format ?? null,
		metadata: freezeArtifactValue(input.metadata || {}),
		array
	});
}
