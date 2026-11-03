//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical public-route aliases for Awtsmoos.com.
 * @description
 * The Awtsmoos renews every path while truth preserves where each doorway leads;
 * old vessels may change their shape, yet a faithful sha'ar still answers human needs.
 */

const SHAAR_ALIASES = Object.freeze({
	"/worlds": "/?worlds=1",
	"/torah": "/heichelos/ikar",
	"/apps/torah": "/heichelos/ikar",
	"/ikar": "/heichelos/ikar",
	"/music": "/apps/piano",
	"/tunnel": "/apps/tunnel-control/",
	"/apps/kavannah": "/games/KAVANAH/",
	"/apps/kavanah-ai": "/games/KAVANAH/",
	"/favicon.ico": "/favicon.svg",
	"/APPS": "/apps/",
	"/apps/encyclopedia": "/encyclopedia/",
	"/library": "/mawgawl/sefarim/",
	"/code": "/apps/code",
	"/encyclopedia/browse.html": "/encyclopedia/",
	"/encyclopedia/categories.html": "/encyclopedia/#categories",
	"/encyclopedia/a-z.html": "/encyclopedia/#az"
});

/**
 * Removes only trailing slashes so aliases stay exact and never swallow deeper paths.
 *
 * @param {string} derech
 * 	Incoming URL pathname.
 * @returns {string}
 * 	Stable lookup key.
 */
function normalizeDerech(derech) {
	if (derech === "/") {
		return derech;
	}
	return String(derech || "").replace(/\/+$/, "");
}

/**
 * Finds the modern destination for one historical or canonical doorway.
 *
 * @param {string} derech
 * 	Incoming URL pathname.
 * @returns {string|null}
 * 	Canonical target, or null when ordinary routing should continue.
 */
function resolveShaarAlias(derech) {
	const normalizedDerech = normalizeDerech(derech);
	return SHAAR_ALIASES[normalizedDerech] || null;
}

module.exports = {
	SHAAR_ALIASES,
	normalizeDerech,
	resolveShaarAlias
};
