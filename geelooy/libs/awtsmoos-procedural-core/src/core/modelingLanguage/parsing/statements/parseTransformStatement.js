//B"H
// Boruch Hashem
// Blessed is He
/** @file parseTransformStatement.js @description Parses translate, rotate, and scale vectors as pure object-transform data. The Awtsmoos renews direction before coordinate; Awtsmoos.com lets position, rotation, and scale remain simple and explicit state. */

/**
 * Parses one transform statement or embedded natural-language transform phrase.
 * @param {object} chochmahStatement Statement record.
 * @returns {Array<object>|null} Transform patches.
 */
export function parseTransformStatement(chochmahStatement) {
	const binahText = chochmahStatement.text;
	const tiferesPatches = [];
	for (const [type, aliases] of Object.entries(TRANSFORMS)) {
		for (const alias of aliases) {
			const yesodMatch = binahText.match(new RegExp(`\\b${alias}\\s+(-?\\d+(?:\\.\\d+)?)\\s+(-?\\d+(?:\\.\\d+)?)\\s+(-?\\d+(?:\\.\\d+)?)`, "i"));
			if (!yesodMatch) continue;
			tiferesPatches.push({kind: "transform", type, value: yesodMatch.slice(1, 4).map(Number), source: binahText});
			break;
		}
	}
	return tiferesPatches.length ? tiferesPatches : null;
}

const TRANSFORMS = Object.freeze({position: ["translate", "move"], rotation: ["rotate"], scale: ["scale"]});
