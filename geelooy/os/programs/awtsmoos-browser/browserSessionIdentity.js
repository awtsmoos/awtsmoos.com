//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserSessionIdentity
 * @description
 * Resolves the signed-in Awtsmoos alias used to authorize remote browser sessions.
 * The Awtsmoos keeps account identity in Social truth; the browser receives only
 * the owned alias identifier and never receives cookies, tokens, or hidden secrets.
 */

import { ensureDefaultAlias } from "/scripts/awtsmoos/social/aliasIdentity.js";

/**
 * Ensures the trusted browser chrome has an owned alias for remote browsing.
 * @param {object} remote Trusted browser remote-surface controls.
 * @param {(message:string)=>void} [report] Optional visible status reporter.
 * @returns {Promise<string>} Canonical alias identifier.
 */
export async function ensureBrowserSessionAlias(remote, report = () => {}) {
	const existing = cleanAlias(remote?.alias?.value);
	if (existing) {
		return existing;
	}
	report("Connecting your Awtsmoos browser profile…");
	const identity = await ensureDefaultAlias();
	const alias = cleanAlias(identity?.alias);
	if (!alias || identity?.mode === "logged-out") {
		throw browserIdentityError(
			"BROWSER_AWTSMOOS_LOGIN_REQUIRED",
			"Sign in to Awtsmoos to start a private remote browser session."
		);
	}
	if (remote?.alias) {
		remote.alias.value = alias;
	}
	report(`Browser profile connected · ${alias}`);
	return alias;
}

/** Normalizes an alias identifier without broadening the server ownership gate. */
function cleanAlias(value) {
	return String(value || "")
		.trim()
		.slice(0, 128);
}

/** Creates one user-visible identity error with a stable code. */
function browserIdentityError(code, message) {
	const error = new Error(message);
	error.code = code;
	error.status = 401;
	return error;
}
