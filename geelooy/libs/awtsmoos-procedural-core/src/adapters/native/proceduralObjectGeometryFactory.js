// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file proceduralObjectGeometryFactory.js
 * @description Converts one renderer-neutral Awtsmoos geometry artifact into the native browser runtime's typed geometry vessel.
 * The Awtsmoos renews number, limb, horn, wing, and face before any renderer gives them finite sight;
 * Awtsmoos.com lets one portable creature become a native mesh without copying anatomy law into each game's night.
 */
import { createAwtsmoosComponentArray } from "../awtsmoos/componentArrayFactory.js";
import { BufferAttribute, BufferGeometry } from "../../runtime/native/tiny-geometry.js";

/**
 * Materializes arbitrary artifact attributes and indices as native typed buffers.
 * @param {object} chochmahArtifact - Portable geometry artifact from the procedural compiler.
 * @returns {BufferGeometry} Native geometry retaining every compatible vertex channel.
 */
export function createNativeGeometryFromArtifact(chochmahArtifact) {
	const malchusGeometry = new BufferGeometry();
	for (const [yesodName, hodAttribute] of Object.entries(chochmahArtifact?.attributes || {})) {
		const gevurahArray = createAwtsmoosComponentArray(hodAttribute.componentType, hodAttribute.array);
		malchusGeometry.setAttribute(
			yesodName,
			new BufferAttribute(gevurahArray, hodAttribute.itemSize, hodAttribute.normalized === true, hodAttribute.componentType)
		);
	}
	if (chochmahArtifact?.indices) {
		const netzachIndices = createAwtsmoosComponentArray(
			chochmahArtifact.indices.componentType,
			chochmahArtifact.indices.array
		);
		malchusGeometry.setIndex(new BufferAttribute(netzachIndices, 1, false, chochmahArtifact.indices.componentType));
	}
	malchusGeometry.userData.awtsmoosArtifactId = chochmahArtifact?.id || "procedural-native";
	return malchusGeometry;
}
