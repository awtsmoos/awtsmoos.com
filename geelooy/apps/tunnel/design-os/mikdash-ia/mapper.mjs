//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file URL → Mikdash level classification.
 * @description Maps awtsmoos.com routes onto the four levels.
 * Order of checks matters: Kodesh registry first (it outranks everything),
 * then post pages (Heichal), then browse pages (Azarah), then the gateway.
 */

import { isKodeshPath } from "./kodeshRegistry.mjs";

/** Gateway paths: the entrance. Exact matches and shallow prefixes. */
const SHAAR_PATHS = [
	"/",
	"/about",
	"/contact",
	"/donate",
	"/derech",
	"/index.html",
];

/** Azarah path prefixes: browse, search, indexes. */
const AZARAH_PREFIXES = [
	"/heichelos",
	"/heichelos/discover",
	"/heichelos/details",
	"/heichel",
	"/search",
	"/series",
	"/parsha",
	"/browse",
	"/library",
	"/social",
];

/** Heichal path patterns: a single teaching. */
const HEICHAL_PATTERNS = [
	/\/post\/[^/]+/i, // /.../post/<id>
	/\/heichelos\/post\//i,
	/\/article\//i,
	/\/maamar\//i,
];

/** Normalize a URL or path into a bare path string. */
export function toPath(urlOrPath) {
	if (typeof urlOrPath !== "string") return "/";
	const s = urlOrPath.trim();
	try {
		// Full URL → pathname.
		if (/^https?:\/\//i.test(s)) return new URL(s).pathname || "/";
	} catch {
		// Fall through to path handling.
	}
	const q = s.split(/[?#]/)[0];
	return q === "" ? "/" : q.startsWith("/") ? q : `/${q}`;
}

/**
 * Classify a URL into a Mikdash level id: "shaar" | "azarah" | "heichal" | "kodesh".
 * @param {string} urlOrPath
 */
export function classify(urlOrPath) {
	const path = toPath(urlOrPath);

	// 1. Kodesh HaKodashim outranks everything — the registry decides.
	if (isKodeshPath(path)) return "kodesh";

	// 2. A single teaching is Heichal.
	if (HEICHAL_PATTERNS.some((re) => re.test(path))) return "heichal";

	// 3. Series index pages are Azarah (browse), even though they live under /series/.
	//    Only a /post/ beneath them ascends to Heichal.
	if (/\/series\/[^/]+\/?$/i.test(path)) return "azarah";

	// 4. Browse prefixes are Azarah.
	const lower = path.toLowerCase();
	if (AZARAH_PREFIXES.some((pre) => lower === pre || lower.startsWith(`${pre}/`))) {
		return "azarah";
	}

	// 5. Gateway exact paths are Shaar.
	if (SHAAR_PATHS.includes(lower)) return "shaar";

	// 6. Default: unknown paths are treated as Azarah (public courtyard)
	//    rather than wrongly promoting them into the Heichal.
	return "azarah";
}

/** Numeric depth (1-4) of a URL. */
export function depthOf(urlOrPath) {
	const id = classify(urlOrPath);
	return { shaar: 1, azarah: 2, heichal: 3, kodesh: 4 }[id];
}

/** True when navigating from `from` to `to` is an ascent (deeper/holier). */
export function isAscentUrl(from, to) {
	return depthOf(to) > depthOf(from);
}
