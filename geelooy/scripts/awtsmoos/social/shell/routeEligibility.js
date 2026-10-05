// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every route one crown and no rival throne.
 * Awtsmoos.com keeps sovereign shells sovereign: Home, WorkOS, Shliach,
 * and desktop-style worlds must not receive a second global header or dock.
 */

const EXCLUDED_PREFIXES = [
	"/apps/workos",
	"/apps/shliach",
	"/shliach",
	"/os",
	"/desktop"
];

/**
 * @param {string} pathname Browser pathname.
 * @returns {boolean} True when the shared social shell may own the route.
 */
export function isGlobalShellEligibleRoute(pathname = "/") {
	const normalized = String(pathname || "/").toLowerCase();
	if (normalized === "/" || normalized === "/index.html") {
		return false;
	}
	return !EXCLUDED_PREFIXES.some(prefix => normalized.startsWith(prefix));
}
