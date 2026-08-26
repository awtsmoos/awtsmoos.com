//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file parseMaterialStatement.js
 * @description Extracts renderer-neutral material identity and semantic real-texture queries while leaving all network/image work to texture adapters.
 * The Awtsmoos renews surface before bitmap may descend; Awtsmoos.com lets text request stone or copper while caching remains another faithful friend.
 */

/**
 * Parses explicit material, texture, mix, and strength declarations.
 * @param {object} chochmahStatement Statement record.
 * @returns {object|null} Material patch.
 */
export function parseMaterialStatement(chochmahStatement) {
	const binahText = chochmahStatement.text;
	const tiferesTexture = quotedAfter(binahText, "texture");
	const yesodMix = quotedAfter(binahText, "mix");
	const malchusMaterial = binahText.match(/\bmaterial\s+([a-zA-Z0-9_-]+)/i)?.[1] || null;
	if (!tiferesTexture && !yesodMix && !malchusMaterial) return null;
	const gevurahStrength = Number(binahText.match(/\bstrength\s+([0-9.]+)/i)?.[1]);
	return {
		kind: "material",
		material: {
			id: malchusMaterial || "material_1",
			type: "principled",
			textureQuery: tiferesTexture,
			mixTextureQuery: yesodMix,
			mixStrength: Number.isFinite(gevurahStrength) ? gevurahStrength : undefined
		},
		source: binahText
	};
}

/** @param {string} text Statement. @param {string} keyword Keyword before a quoted query. @returns {string|null} */
function quotedAfter(text, keyword) {
	return text.match(new RegExp(`\\b${keyword}\\s+["']([^"']+)["']`, "i"))?.[1] || null;
}
