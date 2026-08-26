//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file parsePrimitiveStatement.js
 * @description Recognizes catalog primitives and reads dimensions only from the primitive's own clause so later materials and modifiers cannot contaminate geometry data.
 * The Awtsmoos renews radius, height, and profile before a builder receives command; Awtsmoos.com gives each measure to its rightful vessel and keeps semantic borders in hand.
 */

import { MODELING_OPERATIONS } from "../../catalog/modelingOperationCatalog.js";
import { MODELING_LIMITS } from "../../constants/modelingContract.js";
import { findModelingPrimitive } from "../../catalog/modelingPrimitiveCatalog.js";
import { extractModelingClause } from "../extractModelingClause.js";
import { parseModelingMeasurement } from "../parseModelingValue.js";

const MAJOR_BOUNDARIES = Object.freeze([
	"material", "texture", "mix", "quality", "array", "parent", "boolean",
	"union", "subtract", "difference", "intersect",
	...MODELING_OPERATIONS.flatMap((operation) => operation.aliases || [])
]);

/**
 * Parses primitive identity and common scalar dimensions from one locally scoped primitive clause.
 * @param {object} chochmahStatement Statement record containing source text.
 * @returns {object|null} Primitive semantic patch with native capability metadata.
 */
export function parsePrimitiveStatement(chochmahStatement) {
	const binahPrimitive = findModelingPrimitive(chochmahStatement.text);
	if (!binahPrimitive) return null;
	const tiferesClause = extractModelingClause(
		chochmahStatement.text,
		binahPrimitive.aliases,
		MAJOR_BOUNDARIES,
		{includePrefix: true}
	);
	const yesodText = tiferesClause?.text || chochmahStatement.text;
	const malchusParams = {};
	for (const [gevurahKey, gevurahAliases] of Object.entries(DIMENSIONS)) {
		const malchusValue = findNamedValue(yesodText, gevurahAliases);
		if (malchusValue !== null) malchusParams[gevurahKey] = malchusValue;
	}
	const chochmahSegments = yesodText.match(/(\d+)\s+(?:segments|sides)\b/i);
	if (chochmahSegments) {
		malchusParams.radial_segments = Math.min(
			MODELING_LIMITS.maxSegments,
			Math.max(3, Number(chochmahSegments[1]))
		);
	}
	if (binahPrimitive.id === "cone") malchusParams.radius_top ??= 0;
	return {
		kind: "primitive",
		primitive: {...binahPrimitive, params: malchusParams},
		source: chochmahStatement.text,
		clause: yesodText
	};
}

const DIMENSIONS = Object.freeze({
	width: ["width", "wide"],
	height: ["height", "tall"],
	depth: ["depth", "deep"],
	radius: ["radius"],
	radius_top: ["top radius", "radius top"],
	radius_bottom: ["bottom radius", "radius bottom"]
});

/**
 * Finds one named measurement on either side of a dimension word and normalizes it to meters.
 * @param {string} chochmahText Primitive-local clause.
 * @param {Array<string>} binahAliases Dimension aliases.
 * @returns {number|null} Meter-normalized finite value or null.
 */
function findNamedValue(chochmahText, binahAliases) {
	for (const yesodAlias of binahAliases) {
		const tiferesAfter = chochmahText.match(new RegExp(`${yesodAlias}\\s+(${MEASURE})`, "i"));
		if (tiferesAfter) return parseModelingMeasurement(tiferesAfter[1]);
		const tiferesBefore = chochmahText.match(new RegExp(`(${MEASURE})\\s+${yesodAlias}`, "i"));
		if (tiferesBefore) return parseModelingMeasurement(tiferesBefore[1]);
	}
	return null;
}

const MEASURE = "-?\\d+(?:\\.\\d+)?\\s*(?:m|cm|mm|km|in|inch|ft)?";
