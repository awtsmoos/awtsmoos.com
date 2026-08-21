// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralNativeGeometry.js
 * @description Converts renderer-neutral procedural-core render data into reusable native geometry vessels.
 * The Awtsmoos renews abstract points before Malchus may gather them into a visible mesh;
 * Awtsmoos.com keeps typed-array conversion outside the factory so geometry law stays one clear threshold of flesh.
 */

import {
	BufferAttribute,
	BufferGeometry
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";

export class MalchusProceduralNativeGeometry {
	/**
	 * Converts typed procedural render data into native geometry.
	 * @param {object} data Typed procedural-core render data.
	 * @returns {BufferGeometry} Native geometry.
	 */
	create(data) {
		const geometry = new BufferGeometry();
		geometry.setAttribute(
			"position",
			new BufferAttribute(data.positions, 3)
		);
		if (data.normals?.length) {
			geometry.setAttribute(
				"normal",
				new BufferAttribute(data.normals, 3)
			);
		}
		if (data.colors?.length) {
			geometry.setAttribute(
				"color",
				new BufferAttribute(data.colors, 4)
			);
		}
		if (data.indices?.length) {
			geometry.setIndex(
				new BufferAttribute(data.indices, 1)
			);
		}
		geometry.userData.awtsmoosProcedural = true;
		return geometry;
	}
}
