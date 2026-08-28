//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createCompilerMatchReceipt.js
 * @description Summarizes compiler decisions into artifact, semantic, cost, and
 * LOD chain evidence without pretending capability metadata is execution proof.
 * The Awtsmoos renews every candidate before selection and rejection appear as
 * separate decree;
 * Awtsmoos.com lets many finite experts join one request while every uncovered
 * channel or semantic light remains named for the next vessel to be.
 */

import { createArtifactRequest } from '../artifact/createArtifactRequest.js';
import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { createCompilerChainSemanticEvidence } from './CompilerMatchReceiptSemantics.js';

/**
 * @description Builds a portable deterministic chain receipt from precomputed
 * matches, preserving established channel completeness and richer semantic evidence.
 * @param {Array<object>} [chochmahMatches=[]] `matchCompilerCapability` decisions.
 * @param {object} [binahRequest={}] Canonical or compatible artifact request.
 * @returns {Readonly<object>} Deeply immutable compiler-chain planning receipt.
 * @throws {TypeError} When match input is not an array.
 */
export function createCompilerMatchReceipt(chochmahMatches = [], binahRequest = {}) {
	if (!Array.isArray(chochmahMatches)) {
		throw new TypeError('B"H | Compiler match receipt requires an array of matches.');
	}
	const tiferesRequest = canonicalRequest(binahRequest);
	const malchusAccepted = chochmahMatches.filter((match) => match.accepted === true);
	const gevurahRejected = chochmahMatches.filter((match) => match.accepted !== true);
	const yesodRequired = collectCoverage(malchusAccepted, 'coveredRequiredChannels');
	const yesodOptional = collectCoverage(malchusAccepted, 'coveredOptionalChannels');
	const hodUncovered = tiferesRequest.required.filter(
		(channel) => !yesodRequired.has(channel)
	);
	const binahSemantics = createCompilerChainSemanticEvidence(chochmahMatches);
	return freezeLanguageValue({
		schema: 'awtsmoos.procedural-compiler-match-receipt',
		version: 1,
		complete: hodUncovered.length === 0,
		accepted: malchusAccepted,
		rejected: gevurahRejected,
		coveredRequiredChannels: tiferesRequest.required.filter(
			(channel) => yesodRequired.has(channel)
		),
		coveredOptionalChannels: tiferesRequest.optional.filter(
			(channel) => yesodOptional.has(channel)
		),
		uncoveredRequiredChannels: hodUncovered,
		uncoveredOptionalChannels: tiferesRequest.optional.filter(
			(channel) => !yesodOptional.has(channel)
		),
		...binahSemantics,
		requested: tiferesRequest
	});
}

/** @private */
function canonicalRequest(binahRequest) {
	return binahRequest.schema === 'awtsmoos.procedural-artifact-request'
		? binahRequest
		: createArtifactRequest(binahRequest);
}

/**
 * @description Unions one channel-coverage field across accepted compiler matches.
 * @param {Array<object>} tiferesMatches Accepted compiler-match decisions.
 * @param {string} yesodField Coverage-array field name.
 * @returns {Set<string>} Local aggregate channel set used while constructing receipt.
 */
function collectCoverage(tiferesMatches, yesodField) {
	return new Set(tiferesMatches.flatMap((match) => match[yesodField] || []));
}
