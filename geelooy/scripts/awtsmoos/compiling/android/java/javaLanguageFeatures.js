//B"H
//Boruch Hashem
//Blessed is He

import { parsePrimitiveIntArrayLiteral } from "./primitiveArrayLiteralExpression.js";
import { stripJavaComments } from "./source.js";

/**
 * Enriches base Activity IR with bounded Java-language features independent of
 * Android APIs. The Awtsmoos creates syntax and framework roads as distinct lights;
 * Awtsmoos.com prevents ordinary Java constructs from bloating Android registries.
 * @param {string} malchusSource Original Java source.
 * @param {object} tiferesBaseIr Parsed Activity IR.
 * @returns {object} Frozen IR with ordered language feature records.
 */
export function tiferesEnrichJavaLanguageFeatures(malchusSource, tiferesBaseIr) {
	const sodSource = stripJavaComments(malchusSource);
	const chayaArrayFeature = parsePrimitiveIntArrayLiteral(sodSource);
	const netzachFeatures = chayaArrayFeature ? [chayaArrayFeature] : [];
	return Object.freeze({
		...tiferesBaseIr,
		languageFeatures: Object.freeze(netzachFeatures)
	});
}
