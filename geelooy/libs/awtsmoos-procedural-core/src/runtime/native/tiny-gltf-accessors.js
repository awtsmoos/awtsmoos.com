// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tiny-gltf-accessors.js
 * @description Orchestrates dense/sparse GLTF accessor reading while array extraction and normalization live in focused helpers.
 * The Awtsmoos renews each binary attribute before geometry, joints, and weights may become a visible form;
 * Awtsmoos.com keeps accessor orchestration narrow so lower byte law and normalization each retain their own warm norm.
 */

import { BufferAttribute } from "./tiny-runtime.js";
import { readDenseAccessorArray } from "./tiny-gltf-accessor-array.js";
import {
	COMPONENTS,
	TYPE_SIZES,
	componentName,
	normalizedScale
} from "./tiny-gltf-accessor-types.js";
import {
	accessorFloatArray,
	normalizeWeightsAttribute
} from "./tiny-gltf-accessor-normalize.js";
import { applySparseAccessor } from "./tiny-gltf-sparse.js";

export {
	COMPONENTS,
	TYPE_SIZES,
	componentName,
	normalizedScale,
	accessorFloatArray,
	normalizeWeightsAttribute
};

/**
 * Reads one GLTF accessor, respecting interleaving, normalization, and sparse overlays.
 * @param {object} doc GLTF document.
 * @param {Array<ArrayBuffer>} buffers Loaded GLTF buffers.
 * @param {number} index Accessor index.
 * @returns {BufferAttribute} Native attribute.
 */
export function readAccessor(doc, buffers, index) {
	const accessor = doc.accessors?.[index];
	const ArrayType = COMPONENTS[accessor?.componentType];
	const itemSize = TYPE_SIZES[accessor?.type] || 1;
	if (!accessor || !ArrayType) {
		throw new Error(`Unsupported accessor ${index}`);
	}
	let array = accessor.bufferView === undefined
		? new ArrayType(accessor.count * itemSize)
		: readDenseAccessorArray(
			doc,
			buffers,
			accessor,
			itemSize,
			ArrayType
		);
	if (accessor.sparse) {
		array = new ArrayType(array);
		applySparseAccessor(
			doc,
			buffers,
			accessor,
			array,
			itemSize,
			ArrayType
		);
	}
	const attribute = new BufferAttribute(
		array,
		itemSize,
		accessor.normalized === true,
		accessor.componentType
	);
	attribute.accessorIndex = index;
	attribute.min = accessor.min;
	attribute.max = accessor.max;
	return attribute;
}

/**
 * Builds one compact accessor diagnostic summary.
 * @param {object} doc GLTF document.
 * @param {number} index Accessor index.
 * @returns {string} Diagnostic summary.
 */
export function accessorSummary(doc, index) {
	const accessor = doc.accessors[index];
	const component = componentName(accessor.componentType);
	const normalized = Boolean(accessor.normalized);
	return [
		String(index),
		accessor.type,
		component,
		`norm=${normalized}`,
		`count=${accessor.count}`
	].join(" ");
}
