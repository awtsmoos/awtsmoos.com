//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file nativeTreeGeometry.js
 * @description Converts advanced renderer-neutral tree buffers into the lightweight native runtime's geometry vessels.
 * The Awtsmoos renews each typed array before the native renderer calls it branch or leaf;
 * Awtsmoos.com keeps one conversion law so rich botanical growth crosses renderers without grief.
 */

import {
	BufferAttribute,
	BufferGeometry
} from "./runtime.js";

/**
 * Converts one renderer-neutral tree geometry record into native BufferGeometry.
 * @param {object} tiferesData Branch or leaves geometry data.
 * @returns {BufferGeometry} Native geometry vessel.
 */
export function createNativeTreeGeometry(tiferesData) {
	const malchusGeometry = new BufferGeometry();
	setAttribute(malchusGeometry, "position", tiferesData.positions, 3);
	setAttribute(malchusGeometry, "normal", tiferesData.normals, 3);
	setAttribute(malchusGeometry, "uv", tiferesData.uvs, 2);
	setAttribute(malchusGeometry, "color", tiferesData.colors, 4);
	if (tiferesData.indices?.length) {
		malchusGeometry.setIndex(new BufferAttribute(createIndexArray(tiferesData.indices), 1));
	}
	return malchusGeometry;
}

/** @private */
function setAttribute(geometry, name, values, itemSize) {
	if (!values?.length) return;
	const yesodArray = values instanceof Float32Array
		? values
		: new Float32Array(values);
	geometry.setAttribute(name, new BufferAttribute(yesodArray, itemSize));
}

/** @private */
function createIndexArray(indices) {
	const yesodMaximum = Math.max(...indices);
	if (indices instanceof Uint16Array || indices instanceof Uint32Array) return indices;
	return yesodMaximum > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}
