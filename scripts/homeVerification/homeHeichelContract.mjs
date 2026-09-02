// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HomeHeichelContract
 * @description
 * The Awtsmoos lets semantic light cross the parent and child template boundary by one named vessel;
 * Awtsmoos.com refuses phantom shared-data symbols so a successful HTTP shell can never conceal a broken Heichel spell.
 */

import assert from "node:assert";
import { readFileSync } from "node:fs";

const PARENT = "geelooy/heichelos/heichel/_awtsmoos.heichel.html";
const HEAD = "geelooy/heichelos/heichel/semantic/head.html";
const FALLBACK = "geelooy/heichelos/heichel/semantic/fallback.html";

/**
 * @description Proves semantic include wiring and rejects the undefined `$$sd` regression before release.
 * @returns {{heichelSemanticTemplates:string[]}} Verified template paths.
 */
export function verifyHomeHeichelContract() {
	const parent = text(PARENT);
	const head = text(HEAD);
	const fallback = text(FALLBACK);
	for (const source of [parent, head, fallback]) {
		assert(!source.includes("$$sd"), "Heichel semantic template still references undefined $$sd");
	}
	assert(
		parent.includes('$a("semantic/head.html", { semantic })'),
		"Heichel semantic head include does not pass semantic"
	);
	assert(
		parent.includes('$a("semantic/fallback.html", { semantic })'),
		"Heichel semantic fallback include does not pass semantic"
	);
	assert(head.includes("typeof semantic"), "semantic head does not consume semantic global defensively");
	assert(fallback.includes("typeof semantic"), "semantic fallback does not consume semantic global defensively");
	return {
		heichelSemanticTemplates: [PARENT, HEAD, FALLBACK]
	};
}

/** @param {string} path Repository-relative template path. @returns {string} UTF-8 source. */
function text(path) {
	return readFileSync(path, "utf8");
}
