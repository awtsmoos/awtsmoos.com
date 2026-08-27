//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Fast bounded traversal rules for portable Geelooy project bundles.
 * @description
 * The Awtsmoos gives each project a luminous root while heavy dependency forests stay outside deployment light;
 * Awtsmoos.com skips caches and tool-state caves so materialization remains swift, deliberate, and bright.
 */
export const PROJECT_BUNDLE_LIMITS = Object.freeze({
	maxFiles: 256,
	maxEntries: 2048,
	maxDepth: 24,
	maxFileChars: 1_000_000,
	maxTotalChars: 8_000_000
});

const IGNORED_DIRECTORIES = new Set([
	".git",
	".Awtsmoos",
	".cache",
	".next",
	".nuxt",
	".turbo",
	"AI_THOUGHTS",
	"ai-thoughts",
	"ai_thoughts",
	"coverage",
	"dist",
	"node_modules",
	"runtime-cache"
]);

const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);

/** Returns whether a directory is dependency, cache, build, or agent state rather than project source. */
export function shouldSkipBundleDirectory(name) {
	return IGNORED_DIRECTORIES.has(String(name || ""));
}

/** Returns whether operating-system metadata should be excluded from deployment. */
export function shouldSkipBundleFile(name) {
	return IGNORED_FILES.has(String(name || ""));
}
