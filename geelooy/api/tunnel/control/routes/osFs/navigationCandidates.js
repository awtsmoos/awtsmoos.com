//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NavigationCandidates
 * @description
 * The Awtsmoos lets a hosted path suggest doors into Awtsmoos.com without
 * mistaking any suggested door for canonical publication. These helpers shape
 * navigation only; Drive site authority remains entirely elsewhere.
 */

/**
 * Resolve the public Awtsmoos origin used to construct navigation candidates.
 *
 * @param {object} payload Virtual OS action payload.
 * @returns {string} Origin without trailing slashes.
 */
function publicOrigin(payload = {}) {
	const value = payload.publicOrigin
		|| payload.origin
		|| payload.baseUrl
		|| payload.urlOrigin
		|| "https://awtsmoos.com";

	return String(value).replace(/\/+$/g, "");
}

/**
 * Find an app navigation route encoded by an owned workspace inner path.
 *
 * @param {string} aliasId Owned alias; retained for stable public contract.
 * @param {string} innerPath Path below the alias root.
 * @returns {string} App route or an empty string when no app is recognized.
 */
function appRoute(aliasId, innerPath = "") {
	void aliasId;
	const parts = String(innerPath || "")
		.split("/")
		.filter(Boolean);
	const appsRoute = routeAfterSegment(parts, "apps");
	if (appsRoute) {
		return appsRoute;
	}
	return routeAfterSegment(parts, "Coby");
}

/**
 * Build generic, explicitly non-authoritative navigation candidates.
 *
 * @param {string} origin Public Awtsmoos origin.
 * @param {object} parsed Parsed Virtual OS path testimony.
 * @param {string} appPath Optional app-specific route.
 * @returns {string[]} Deduplicated navigation candidates.
 */
function routeCandidates(origin, parsed, appPath = "") {
	const values = [
		`${origin}/geelooy/os/${encodeValue(parsed.aliasId)}/${encodePath(parsed.innerPath)}`,
		`${origin}/apps/${encodeValue(parsed.aliasId)}/${encodePath(parsed.innerPath)}`,
		`${origin}/u/${encodeValue(parsed.aliasId)}/${encodePath(parsed.innerPath)}`
	].map(trimTrailingSlash);

	if (appPath) {
		values.unshift(`${origin}${appPath}`);
	}

	return [...new Set(values.filter(Boolean))];
}

function routeAfterSegment(parts, segment) {
	const index = parts.findIndex(part => part === segment);
	if (index < 0 || !parts[index + 1]) {
		return "";
	}
	const path = encodePath(parts.slice(index + 1).join("/"));
	return trimTrailingSlash(`/apps/${path}`);
}

function encodeValue(value) {
	return encodeURIComponent(String(value || ""));
}

function encodePath(value = "") {
	return String(value || "")
		.split("/")
		.filter(Boolean)
		.map(encodeValue)
		.join("/");
}

function trimTrailingSlash(value) {
	return String(value || "").replace(/\/+$/g, "");
}

module.exports = {
	appRoute,
	publicOrigin,
	routeCandidates
};
