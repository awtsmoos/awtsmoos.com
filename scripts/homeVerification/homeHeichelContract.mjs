//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file homeHeichelContract.mjs
 * @description
 * The Awtsmoos reveals one semantic ray through one honest rendering path;
 * Awtsmoos.com verifies rendered fragments by behavior, not by one temporary variable name.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PARENT = 'geelooy/heichelos/heichel/_awtsmoos.heichel.html';
const SHELL = 'geelooy/heichelos/routes/heichel/shell.js';
const HEAD = 'geelooy/heichelos/heichel/semantic/head.html';
const FALLBACK = 'geelooy/heichelos/heichel/semantic/fallback.html';

/** Reads one authored source vessel for structural release verification. */
function readContractSource(filePath) {
	return readFileSync(filePath, 'utf8');
}

/** Finds the shell variable that receives pre-rendered semantic fragments. */
function semanticFragmentBinding(shell) {
	return shell.match(
		/const\s+([A-Za-z_$][\w$]*)\s*=\s*await\s+renderSemanticFragments\(semantic,\s*discovery(?:,\s*context)?\);/
	)?.[1] || '';
}

/** Verifies semantic ownership from route pre-rendering through parent manifestation. */
export function verifyHomeHeichelContract() {
	const parent = readContractSource(PARENT);
	const shell = readContractSource(SHELL);
	const head = readContractSource(HEAD);
	const fallback = readContractSource(FALLBACK);
	const sources = [parent, shell, head, fallback];

	for (const source of sources) {
		assert.equal(source.includes('$$sd'), false, 'Heichel semantic source still references undefined $$sd');
	}

	assert.equal(
		shell.includes("$i.$ga('./heichel/semantic/head.html', { semantic })"),
		true,
		'Heichel route shell does not pre-render semantic head'
	);
	assert.equal(
		shell.includes("$i.$ga('./heichel/semantic/fallback.html', { semantic, discovery })"),
		true,
		'Heichel route shell does not pre-render semantic fallback with discovery'
	);

	const fragmentBinding = semanticFragmentBinding(shell);
	assert.notEqual(fragmentBinding, '', 'Heichel shell does not bind rendered semantic fragments');
	assert.equal(
		shell.includes(`...${fragmentBinding}`),
		true,
		'Heichel shell does not pass rendered fragments to parent'
	);
	assert.equal(
		parent.includes('typeof semanticHead === "string" ? semanticHead : ""'),
		true,
		'Heichel parent does not consume rendered semantic head defensively'
	);
	assert.equal(
		parent.includes('typeof semanticFallback === "string" ? semanticFallback : ""'),
		true,
		'Heichel parent does not consume rendered semantic fallback defensively'
	);
	assert.equal(
		parent.includes('$a("semantic/fallback.html"'),
		false,
		'Heichel parent redundantly re-renders semantic fallback'
	);
	assert.equal(head.includes('typeof semantic'), true, 'Heichel semantic head is not defensive');
	assert.equal(fallback.includes('typeof semantic'), true, 'Heichel semantic fallback is not defensive');
	assert.equal(fallback.includes('data-heichel-semantic-fallback'), true, 'Heichel fallback marker is missing');

	return { heichelSemanticTemplates: [PARENT, HEAD, FALLBACK] };
}
