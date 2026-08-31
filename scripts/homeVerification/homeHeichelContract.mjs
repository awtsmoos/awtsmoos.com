// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeHeichelContract
 * @description
 * The Awtsmoos lets route-local semantic light cross the shell boundary before the parent document begins;
 * Awtsmoos.com rejects global-template shadows, so title and fallback remain visible when the living Heichel sings.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";

const SHELL = "geelooy/heichelos/routes/heichel/shell.js";
const PARENT = "geelooy/heichelos/heichel/_awtsmoos.heichel.html";
const HEAD = "geelooy/heichelos/heichel/semantic/head.html";
const FALLBACK = "geelooy/heichelos/heichel/semantic/fallback.html";

/**
 * @description Proves the route shell renders semantic partials locally and the parent consumes finished HTML strings.
 * @returns {{heichelSemanticTemplates:string[]}} Verified source paths.
 */
export function verifyHomeHeichelContract() {
	const shell = text(SHELL);
	const parent = text(PARENT);
	const head = text(HEAD);
	const fallback = text(FALLBACK);
	for (const source of [shell, parent, head, fallback]) {
		assert(!source.includes("$$sd"), "Heichel semantic source still references undefined $$sd");
	}
	assert(
		shell.includes("$i.$ga('./heichel/semantic/head.html', { semantic })"),
		"Heichel shell does not render semantic head through route-local $ga"
	);
	assert(
		shell.includes("$i.$ga('./heichel/semantic/fallback.html', { semantic })"),
		"Heichel shell does not render semantic fallback through route-local $ga"
	);
	assert(parent.includes("semanticHead"), "Heichel parent does not consume pre-rendered semantic head");
	assert(parent.includes("semanticFallback"), "Heichel parent does not consume pre-rendered semantic fallback");
	assert(!parent.includes('$a("semantic/'), "Heichel parent still uses global $a for route-local semantic files");
	assert(head.includes("typeof semantic"), "semantic head does not consume semantic global defensively");
	assert(fallback.includes("typeof semantic"), "semantic fallback does not consume semantic global defensively");
	return {
		heichelSemanticTemplates: [SHELL, PARENT, HEAD, FALLBACK]
	};
}

/**
 * @description Reads one repository-relative semantic source vessel.
 * @param {string} path Repository-relative template path.
 * @returns {string} UTF-8 source.
 */
function text(path) {
	return readFileSync(path, "utf8");
}
