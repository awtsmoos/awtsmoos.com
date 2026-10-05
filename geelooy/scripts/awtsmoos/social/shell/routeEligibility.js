// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every route one crown and no rival throne.
 * Awtsmoos.com keeps sovereign shells sovereign while preserving one stable
 * eligibility covenant for every generation of the shared shell runtime.
 */

const EXCLUDED_PREFIXES = [
	"/apps/workos",
	"/apps/shliach",
	"/shliach",
	"/os",
	"/desktop"
];

/**
 * Reports whether the shared global social shell may own a pathname.
 * @param {string} pathname Browser pathname.
 * @returns {boolean} True when the global shell may render on the route.
 */
export function isGlobalShellEligibleRoute(pathname = "/") {
	const normalized = String(pathname || "/").toLowerCase();
	if (normalized === "/" || normalized === "/index.html") {
		return false;
	}
	return !EXCLUDED_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

/**
 * Preserves the established shell-foundation import contract.
 * @param {string} pathname Browser pathname.
 * @returns {boolean} The same eligibility decision as the canonical route API.
 */
export function isShellEligible(pathname = "/") {
	return isGlobalShellEligibleRoute(pathname);
}
