//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralNativeGeometry.js
 * @description Converts renderer-neutral Procedural Core render data into native geometry while optionally revealing semantic ecology-zone identity through the Core's canonical four-component `zone` attribute.
 * The Awtsmoos renews abstract point before position, normal, color, UV, index, and ecological identity can appear as separate form;
 * Awtsmoos.com lets Malchus gather typed arrays honestly, while untagged geometry inherits the native Core's truthful generic meadow norm.
 */

import {
	BufferAttribute,
	BufferGeometry
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import { revealProceduralZoneValues } from "./ProceduralZoneAttribute.js";

export class MalchusProceduralNativeGeometry {
	/**
	 * @description Materializes positions plus every available optional render attribute, expands explicit ecology-zone identity per vertex, and records lightweight procedural provenance on the resulting native geometry.
	 * @param {object} malchusData Typed renderer-neutral primitive data containing positions and optional normals, colors, UVs, and indices.
	 * @param {{zone?:ArrayLike<number>}} [yesodOptions={}] Optional semantic geometry metadata whose `zone` becomes a native four-component vertex attribute.
	 * @returns {BufferGeometry} Native geometry ready for Procedural Core mesh materialization.
	 */
	create(malchusData, yesodOptions = {}) {
		const malchusGeometry = new BufferGeometry();
		malchusGeometry.setAttribute("position", new BufferAttribute(malchusData.positions, 3));
		this.setOptionalAttribute(malchusGeometry, "normal", malchusData.normals, 3);
		this.setOptionalAttribute(malchusGeometry, "color", malchusData.colors, 4);
		this.setOptionalAttribute(malchusGeometry, "uv", malchusData.uvs, 2);
		if (yesodOptions.zone) {
			const malchusVertexCount = Math.floor(malchusData.positions.length / 3);
			malchusGeometry.setAttribute(
				"zone",
				new BufferAttribute(revealProceduralZoneValues(malchusVertexCount, yesodOptions.zone), 4)
			);
		}
		if (malchusData.indices?.length) malchusGeometry.setIndex(new BufferAttribute(malchusData.indices, 1));
		malchusGeometry.userData.awtsmoosProcedural = true;
		malchusGeometry.userData.awtsmoosUvReady = Boolean(malchusData.uvs?.length);
		malchusGeometry.userData.awtsmoosZoneReady = Boolean(yesodOptions.zone);
		return malchusGeometry;
	}

	/**
	 * @description Installs one optional native vertex attribute only when authored values exist, keeping absent normals/colors/UVs truly absent instead of allocating meaningless buffers.
	 * @param {BufferGeometry} malchusGeometry Native geometry receiving the optional attribute.
	 * @param {string} yesodName Canonical native attribute name.
	 * @param {ArrayLike<number>|undefined} chochmahValues Typed or array-like attribute values, or undefined when the procedural source omitted the channel.
	 * @param {number} gevurahItemSize Number of scalar values belonging to each vertex item.
	 * @returns {void}
	 */
	setOptionalAttribute(malchusGeometry, yesodName, chochmahValues, gevurahItemSize) {
		if (chochmahValues?.length) {
			malchusGeometry.setAttribute(yesodName, new BufferAttribute(chochmahValues, gevurahItemSize));
		}
	}
}
