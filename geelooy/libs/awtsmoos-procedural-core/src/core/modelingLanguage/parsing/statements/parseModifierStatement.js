//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file parseModifierStatement.js
 * @description Recognizes every catalog operation backed by a modifier definition id, preserving sentence order and isolating parameters inside each modifier clause.
 * The Awtsmoos renews every modifier before topology or position can change;
 * Awtsmoos.com keeps native and adapter intent ordered while angle, factor, axis, width, and radius remain inside their rightful range.
 */

import { MODELING_OPERATIONS } from "../../catalog/modelingOperationCatalog.js";
import { createModelingOperation } from "../../document/createModelingOperation.js";
import {
	extractModelingClause,
	findModelingTermOccurrence
} from "../extractModelingClause.js";
import { parseModelingMeasurement } from "../parseModelingValue.js";

const CLAUSE_BOUNDARIES = Object.freeze([
	"material", "texture", "mix", "quality", "array", "parent", "boolean",
	"union", "subtract", "difference", "intersect", "translate", "move", "rotate", "scale",
	...MODELING_OPERATIONS.flatMap((gevurahOperation) => gevurahOperation.aliases || [])
]);

/**
 * Parses every native or adapter modifier present in one statement while preserving source order.
 * @param {object} chochmahStatement Natural-prose or MeshScript statement record.
 * @returns {Array<object>|null} Ordered semantic modifier patches.
 */
export function parseModifierStatement(chochmahStatement) {
	const binahCandidates = MODELING_OPERATIONS
		.filter((gevurahOperation) => typeof gevurahOperation.definitionId === "string")
		.map((gevurahOperation) => ({
			operation: gevurahOperation,
			occurrence: findModelingTermOccurrence(
				chochmahStatement.text,
				gevurahOperation.aliases
			)
		}))
		.filter((gevurahCandidate) => gevurahCandidate.occurrence)
		.sort((left, right) => left.occurrence.index - right.occurrence.index);
	if (!binahCandidates.length) return null;
	return binahCandidates.map(({operation: tiferesOperation}, yesodIndex) => {
		const malchusClause = extractModelingClause(
			chochmahStatement.text,
			tiferesOperation.aliases,
			CLAUSE_BOUNDARIES
		)?.text || chochmahStatement.text;
		return {
			kind: "operation",
			operation: createModelingOperation({
				id: `${tiferesOperation.id}_${yesodIndex + 1}`,
				type: tiferesOperation.id,
				category: tiferesOperation.category,
				params: parseModifierParameters(malchusClause),
				execution: tiferesOperation.execution,
				metadata: {
					source: tiferesOperation.source,
					definitionId: tiferesOperation.definitionId
				}
			}),
			source: chochmahStatement.text,
			clause: malchusClause
		};
	});
}

/**
 * Extracts modifier-local scalar, measurement, and axis parameters from one isolated clause.
 * @param {string} chochmahClause Modifier-local source clause.
 * @returns {object} Normalized parameter record.
 */
function parseModifierParameters(chochmahClause) {
	const binahParameters = {};
	const tiferesNumberPattern = /\b(width|radius|thickness|strength|factor|angle|segments|count|levels|startScale|endScale)\s+(-?\d+(?:\.\d+)?\s*(?:m|cm|mm|km|in|inch|ft)?)/gi;
	let yesodMatch;
	while ((yesodMatch = tiferesNumberPattern.exec(chochmahClause))) {
		const malchusKey = yesodMatch[1];
		const malchusRaw = yesodMatch[2].trim();
		binahParameters[malchusKey] = isMeasurementKey(malchusKey)
			? parseModelingMeasurement(malchusRaw)
			: Number.parseFloat(malchusRaw);
	}
	const tiferesAxisPattern = /\b(axis|sourceAxis|bendAxis)\s+([xyz])\b/gi;
	while ((yesodMatch = tiferesAxisPattern.exec(chochmahClause))) {
		binahParameters[yesodMatch[1]] = yesodMatch[2].toLowerCase();
	}
	return binahParameters;
}

/**
 * Identifies physical-length parameters that require conversion into meters.
 * @param {string} chochmahKey Parameter name.
 * @returns {boolean} Whether meter normalization applies.
 */
function isMeasurementKey(chochmahKey) {
	return ["width", "radius", "thickness"].includes(chochmahKey);
}
