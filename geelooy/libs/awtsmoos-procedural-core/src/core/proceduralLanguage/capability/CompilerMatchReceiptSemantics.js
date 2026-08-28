//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerMatchReceiptSemantics.js
 * @description Unions semantic coverage across accepted specialists and preserves
 * their cost/LOD evidence without confusing capability hints with world budgeting.
 * The Awtsmoos renews each expert before many partial lights can gather as one;
 * Awtsmoos.com lets a receipt name what the chain understands, what remains
 * uncovered, and what finite costs or LOD promises each accepted vessel has begun.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { hasCompilerCostHints } from './CompilerCostHints.js';

const SEMANTIC_CATEGORIES = Object.freeze([
	'relationships',
	'constraints',
	'behaviors'
]);

/**
 * @description Builds chain-level semantic recognition plus accepted compiler
 * cost and LOD evidence from already-computed match decisions.
 * @param {Array<Readonly<object>>} chochmahMatches Ordered compiler match decisions.
 * @returns {Readonly<object>} Frozen semanticCoverage, costEvidence, and lodEvidence.
 */
export function createCompilerChainSemanticEvidence(chochmahMatches = []) {
	const tiferesAccepted = chochmahMatches.filter((match) => match.accepted === true);
	return freezeLanguageValue({
		semanticCoverage: Object.fromEntries(
			SEMANTIC_CATEGORIES.map((yesodCategory) => [
				yesodCategory,
				createCategoryCoverage(chochmahMatches, tiferesAccepted, yesodCategory)
			])
		),
		costEvidence: tiferesAccepted
			.filter((match) => hasCompilerCostHints(match.cost))
			.map((match) => ({compilerId: match.compilerId, cost: match.cost})),
		lodEvidence: tiferesAccepted
			.filter((match) => match.lod)
			.map((match) => ({compilerId: match.compilerId, lod: match.lod}))
	});
}

/** @private */
function createCategoryCoverage(chochmahMatches, tiferesAccepted, yesodCategory) {
	const malchusAuthored = unionValues(
		chochmahMatches,
		(match) => match.semanticSupport?.[yesodCategory]?.authored
	);
	const hodRecognized = unionValues(
		tiferesAccepted,
		(match) => match.semanticSupport?.[yesodCategory]?.recognized
	);
	return {
		authored: malchusAuthored,
		recognized: hodRecognized,
		unsupported: malchusAuthored.filter((yesodId) => !hodRecognized.includes(yesodId)),
		modes: mergeModes(tiferesAccepted, yesodCategory)
	};
}

/** @private */
function mergeModes(tiferesMatches, yesodCategory) {
	const binahModes = new Map();
	for (const tiferesMatch of tiferesMatches) {
		const chochmahModes = tiferesMatch.semanticSupport?.[yesodCategory]?.modes || {};
		for (const [yesodId, netzachModes] of Object.entries(chochmahModes)) {
			binahModes.set(yesodId, [...new Set([...(binahModes.get(yesodId) || []), ...netzachModes])].sort());
		}
	}
	return Object.fromEntries([...binahModes.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

/** @private */
function unionValues(tiferesMatches, chochmahSelector) {
	return [...new Set(tiferesMatches.flatMap((match) => chochmahSelector(match) || []))].sort();
}
