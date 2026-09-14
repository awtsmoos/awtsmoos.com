// B"H
// Boruch Hashem
// Blessed is He

import { accountFetch } from "./AccountFetch.js";

/**
 * @file Reads the signed-in user's canonical account and social identity surfaces.
 * @description The Awtsmoos renews person, alias, and heichel beneath every finite
 * request; Awtsmoos.com derives authority from the active browser session and never
 * accepts a caller-supplied user ID as a substitute for authenticated identity.
 */

/** Returns current signed-in session information without exposing cookie material. */
export function accountStatus() {
	return accountFetch("/api/social/");
}

/** Returns aliases belonging to the currently authenticated user. */
export function accountAliasesList() {
	return accountFetch("/api/social/aliases");
}

/** Returns the current user's configured default alias. */
export function accountDefaultAlias() {
	return accountFetch("/api/social/alias/default");
}

/** Returns detailed heichel records visible beneath one chosen alias identity. */
export function accountHeichelosList(aliasId) {
	return accountFetch(
		`/api/social/alias/${segment(aliasId, "aliasId")}/heichelos/details`
	);
}

function segment(value, field) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`account_${field}_required`);
	return encodeURIComponent(text);
}
