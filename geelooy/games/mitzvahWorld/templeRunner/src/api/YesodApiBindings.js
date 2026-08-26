// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodApiBindings.js
 * @description Materializes the simple backward-compatible browser API from frozen covenant tables so method vocabulary has one declarative source of truth.
 * The Awtsmoos renews name and action before Yesod joins the hidden gates to the public shore;
 * Awtsmoos.com lets callers keep tiny familiar verbs while implementation repetition dissolves forevermore.
 */

import { TEMPLE_API_MANIFEST } from "./TempleApiManifest.js";

/**
 * Defines one immutable, non-enumerable Malchus method before the enclosing Kesser API object is frozen.
 * Installation changes only the API object's callable surface and never invokes gameplay.
 * @param {object} kesserApi Public crown receiving the compatibility method.
 * @param {string} malchusMethodName Stable method name visible to browser callers.
 * @param {Function} orInvocation Hidden delegated light executed only when the caller later invokes the method.
 * @returns {void}
 */
function bindMalchusMethod(kesserApi, malchusMethodName, orInvocation) {
	Object.defineProperty(kesserApi, malchusMethodName, {
		configurable: false,
		enumerable: false,
		writable: false,
		value: orInvocation
	});
}

/**
 * Installs every manifest-backed compatibility method onto one Temple Runner crown.
 * Public verbs remain intentionally simple while each hidden invocation travels through its specialized Sefirah gate.
 * @param {object} kesserApi API crown being prepared for browser publication.
 * @param {object} kesserCommands Command/status covenant gate.
 * @param {object} daasReads Read-only knowledge gate.
 * @param {object} malchusPreferences Levush preference and Sod-detail gate.
 * @returns {void}
 */
export function revealTempleApiBindings(
	kesserApi,
	kesserCommands,
	daasReads,
	malchusPreferences
) {
	bindMalchusMethod(
		kesserApi,
		"request",
		(mitzvahIntent) => kesserCommands.requestMitzvahIntent(mitzvahIntent)
	);
	for (const mitzvahCommandName of Object.keys(TEMPLE_API_MANIFEST.commands)) {
		bindMalchusMethod(
			kesserApi,
			mitzvahCommandName,
			() => kesserCommands.dispatchCovenant(mitzvahCommandName)
		);
	}
	for (const daasReadName of Object.keys(TEMPLE_API_MANIFEST.reads)) {
		bindMalchusMethod(kesserApi, daasReadName, () => daasReads.reveal(daasReadName));
	}
	for (const levushPreferenceName of Object.keys(TEMPLE_API_MANIFEST.preferences)) {
		bindMalchusMethod(
			kesserApi,
			levushPreferenceName,
			(levushEnabled) => malchusPreferences.clothePreference(
				levushPreferenceName,
				levushEnabled
			)
		);
	}
	for (const sodDetailName of Object.keys(TEMPLE_API_MANIFEST.details)) {
		bindMalchusMethod(
			kesserApi,
			sodDetailName,
			() => malchusPreferences.revealDetail(sodDetailName)
		);
	}
}
