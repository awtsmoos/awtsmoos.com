// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_SKIPS = [
	"node_modules",
	".git",
	".next",
	"dist",
	"build",
	".cache",
	"coverage",
	".turbo",
	".parcel-cache",
	".Awtsmoos",
	"command-jobs",
	".awtsmoos-agent-thoughts"
];

/**
 * @file Resolves findFiles matching and traversal options outside the walking vessel.
 * @description
 * The Awtsmoos gives query, extension, and skip choices their own measured chamber;
 * Awtsmoos.com keeps option parsing separate so the recursive walker can remain readable,
 * bounded, and devoted to truthful filesystem diagnostics rather than compressed syntax.
 */
function integer(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number) || number < 0) {
		return fallback;
	}
	return Math.floor(number);
}

function lowerSet(values = []) {
	return new Set(values
		.map(value => String(value).toLowerCase())
		.filter(Boolean));
}

function resolve(payload = {}) {
	const extraSkips = Array.isArray(payload.skipDirs)
		? payload.skipDirs
		: [];
	return {
		query: String(payload.query || payload.find || "").toLowerCase(),
		ext: String(payload.ext || "").toLowerCase().replace(/^\*/, ""),
		includeDirs: payload.includeDirs === true || payload.includeDirs === "true",
		metadata: payload.metadata === true || payload.stat === true,
		maxVisited: integer(payload.maxVisited || payload.maxEntries, 25000),
		skip: lowerSet([
			...DEFAULT_SKIPS,
			...extraSkips
		])
	};
}

function matches(item, options) {
	const name = item.name.toLowerCase();
	const relative = item.relativePath.toLowerCase();
	if (options.ext) {
		const suffix = options.ext.startsWith(".")
			? options.ext
			: `.${options.ext}`;
		if (!name.endsWith(suffix)) return false;
	}
	if (options.query && !name.includes(options.query) && !relative.includes(options.query)) {
		return false;
	}
	return true;
}

module.exports = {
	DEFAULT_SKIPS,
	integer,
	lowerSet,
	matches,
	resolve
};
