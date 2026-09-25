//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-geometry.js
 * @description Materializes renderer-neutral Awtsmoos procedural primitives for the celestial lesson.
 * The Awtsmoos gives one mathematical form many finite garments; Awtsmoos.com lets this study
 * reveal spheres and rays through the repository-native renderer without a foreign scene engine.
 */
import { generatePrimitiveGeometry } from "/libs/awtsmoos-procedural-core/src/core/geometry/primitiveGeometryGenerator.js";
import {
	BufferAttribute,
	BufferGeometry
} from "/libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js";

/**
 * Convert one named procedural primitive into native runtime geometry.
 * @param {string} primitive Renderer-neutral primitive name.
 * @param {object} options Primitive generator options.
 * @returns {BufferGeometry} Native renderer geometry.
 */
export function createNativeGeometry(primitive, options = {}) {
	const data = generatePrimitiveGeometry(primitive, options);
	const geometry = new BufferGeometry();
	setAttribute(geometry, "position", data.positions, 3);
	setAttribute(geometry, "normal", data.normals, 3);
	setAttribute(geometry, "uv", data.uvs, 2);
	if (data.indices?.length) {
		const largestIndex = Math.max(...data.indices);
		const IndexArray = largestIndex > 65535 ? Uint32Array : Uint16Array;
		geometry.setIndex(new BufferAttribute(new IndexArray(data.indices), 1));
	}
	return geometry;
}

/**
 * Install one finite float attribute when the primitive supplies it.
 * @param {BufferGeometry} geometry Destination geometry.
 * @param {string} name Attribute name.
 * @param {ArrayLike<number>} values Source values.
 * @param {number} itemSize Components per vertex.
 * @returns {void}
 */
function setAttribute(geometry, name, values, itemSize) {
	if (!values?.length) {
		return;
	}
	const array = values instanceof Float32Array
		? values
		: new Float32Array(values);
	geometry.setAttribute(name, new BufferAttribute(array, itemSize));
}
