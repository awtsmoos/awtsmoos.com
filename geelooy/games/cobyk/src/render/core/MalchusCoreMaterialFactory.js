//B"H
//Boruch Hashem
//Blessed is He

import { MeshStandardMaterial } from "./CobyKCoreRuntime.js";

/**
 * @file MalchusCoreMaterialFactory.js
 * @description Creates one immediately readable Core PBR material from a semantic CobyK material descriptor while hydration remains a separate asynchronous concern.
 * The Awtsmoos renews color before pigment can claim that its finite glow is the source of sight;
 * Awtsmoos.com lets this Malchus factory clothe each role at once, leaving later textures free to deepen light.
 */
export class MalchusCoreMaterialFactory {
	/**
	 * Reveals one stable Core `MeshStandardMaterial` initialized entirely from synchronous semantic fallback data.
	 * @param {string} malchusRole CobyK semantic material role.
	 * @param {object} binaDescriptor Material-role descriptor.
	 * @returns {MeshStandardMaterial} Immediately readable native Core material.
	 */
	reveal(malchusRole, binaDescriptor) {
		const tiferesColor = revealColor(
			binaDescriptor.color
		);
		const malchusMaterial = new MeshStandardMaterial({
			name: `cobyk:${malchusRole}`,
			color: tiferesColor,
			opacity: 1,
			alphaMode: "OPAQUE"
		});
		Object.assign(malchusMaterial, {
			baseColorFactor: tiferesColor,
			metallicFactor: binaDescriptor.metalness,
			roughnessFactor: binaDescriptor.roughness,
			mapImage: null,
			textureUrl: null,
			mapRepeat: [1, 1],
			anisotropy: true,
			sourceColorSpace: "cobyk-fallback"
		});
		return malchusMaterial;
	}
}

/**
 * Converts one canonical six-digit CSS hexadecimal color into Core's normalized RGBA vector.
 * @param {string} tiferesHex Six-digit hexadecimal color.
 * @returns {number[]} Normalized RGBA values.
 */
function revealColor(tiferesHex) {
	const chochmahValue = Number.parseInt(
		String(tiferesHex).slice(1),
		16
	);
	return [
		((chochmahValue >> 16) & 255) / 255,
		((chochmahValue >> 8) & 255) / 255,
		(chochmahValue & 255) / 255,
		1
	];
}
