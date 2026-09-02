// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file homeHeichelContract.mjs
 * @description Verifies the Heichel semantic shell from route rendering through parent-template manifestation.
 * The Awtsmoos reveals one semantic light through several honest vessels without rendering the same ray twice;
 * Awtsmoos.com keeps the verifier bound to the living ownership graph, where each boundary is exact and precise.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PARENT = 'geelooy/heichelos/heichel/_awtsmoos.heichel.html';
const SHELL = 'geelooy/heichelos/routes/heichel/shell.js';
const HEAD = 'geelooy/heichelos/heichel/semantic/head.html';
const FALLBACK = 'geelooy/heichelos/heichel/semantic/fallback.html';

/**
 * Reads one source vessel whose authored contract must remain visible to the release gate.
 * @param {string} filePath Repository-relative source path.
 * @returns {string} UTF-8 source text used only for structural verification.
 */
function readContractSource(filePath) {
	return readFileSync(filePath, 'utf8');
}

/**
 * Verifies semantic-head ownership, parent manifestation, fallback wiring, and defensive model access.
 * @returns {{heichelSemanticTemplates: string[]}} Stable receipt consumed by the home-source verifier.
 */
export function verifyHomeHeichelContract() {
	const parent = readContractSource(PARENT);
	const shell = readContractSource(SHELL);
	const head = readContractSource(HEAD);
	const fallback = readContractSource(FALLBACK);
	const contractSources = [parent, shell, head, fallback];

	for (const source of contractSources) {
		assert.equal(source.includes('$$sd'), false, 'Heichel semantic source still references undefined $$sd');
	}

	assert.equal(
		shell.includes("$i.$ga('./heichel/semantic/head.html', { semantic })"),
		true,
		'Heichel route shell does not render semantic head with semantic'
	);
	assert.equal(
		shell.includes('...semanticFragments'),
		true,
		'Heichel route shell does not pass rendered semantic fragments to parent'
	);
	assert.equal(
		parent.includes('typeof semanticHead === "string" ? semanticHead : ""'),
		true,
		'Heichel parent does not consume rendered semantic head defensively'
	);
	assert.equal(
		parent.includes('$a("semantic/fallback.html", { semantic })'),
		true,
		'Heichel semantic fallback include does not pass semantic'
	);
	assert.equal(head.includes('typeof semantic'), true, 'Heichel semantic head is not defensive');
	assert.equal(fallback.includes('typeof semantic'), true, 'Heichel semantic fallback is not defensive');

	return {
		heichelSemanticTemplates: [PARENT, HEAD, FALLBACK]
	};
}
