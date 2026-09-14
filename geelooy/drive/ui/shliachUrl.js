//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ShliachUrl
 * @description
 * Owns the one canonical doorway from Geelooy Sites into the Awtsmoos Shliach GPT.
 * User text enters only through URLSearchParams so prompts cannot corrupt the route.
 */

export const SHLIACH_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
export const SHLIACH_LOGO = "/drive/assets/awtsmoos-shliach-logo.png";

/**
 * Builds a new-tab Shliach URL with the prompt carried by the documented q parameter.
 * @param {unknown} prompt Arbitrary creator text.
 * @returns {string} Safe absolute Shliach destination.
 */
export function buildShliachUrl(prompt = "") {
	const url = new URL(SHLIAH_URL_COMPAT());
	const value = String(prompt || "").trim();
	if (value) url.searchParams.set("q", value);
	return url.toString();
}

/** @returns {string} Canonical URL through a named function for easy test injection. */
function SHLIAH_URL_COMPAT() {
	return SHLIACH_URL;
}
