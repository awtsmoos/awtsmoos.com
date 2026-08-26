//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralNativeGeometry.js
 * @description Converts renderer-neutral procedural render data into reusable native geometry and optionally reveals semantic ecology-zone data through the Core's canonical `zone` attribute.
 * The Awtsmoos renews abstract point before position, normal, color, UV, and ecological identity can appear as separate form;
 * Awtsmoos.com lets Malchus gather typed arrays honestly while untagged geometry inherits the native Core's default meadow norm.
 */

import {
	BufferAttribute,
	BufferGeometry
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { revealProceduralZoneValues } from "./ProceduralZoneAttribute.js";

export class MalchusProceduralNativeGeometry {
	/**
	 * Converts typed procedural render data into native geometry with optional semantic ecology-zone data.
	 * @param {object} data Typed procedural-core render data.
	 * @param {{zone?:ArrayLike<number>}} [options] Optional semantic geometry metadata.
	 * @returns {BufferGeometry} Native geometry.
	 */
	create(data, options = {}) {
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(data.positions, 3));
		this.setOptionalAttribute(geometry, "normal", data.normals, 3);
		this.setOptionalAttribute(geometry, "color", data.colors, 4);
		this.setOptionalAttribute(geometry, "uv", data.uvs, 2);
		if (options.zone) {
			const vertexCount = Math.floor(data.positions.length / 3);
			geometry.setAttribute(
				"zone",
				new BufferAttribute(revealProceduralZoneValues(vertexCount, options.zone), 4)
			);
		}
		if (data.indices?.length) geometry.setIndex(new BufferAttribute(data.indices, 1));
		geometry.userData.awtsmoosProcedural = true;
		geometry.userData.awtsmoosUvReady = Boolean(data.uvs?.length);
		geometry.userData.awtsmoosZoneReady = Boolean(options.zone);
		return geometry;
	}

	/** @param {BufferGeometry} geometry Native geometry. @param {string} name Attribute key. @param {ArrayLike<number>} values Values. @param {number} size Item size. @returns {void} */
	setOptionalAttribute(geometry, name, values, size) {
		if (values?.length) geometry.setAttribute(name, new BufferAttribute(values, size));
	}
}
