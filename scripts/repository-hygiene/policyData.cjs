// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the immutable borders of the repository hygiene covenant.
 * @description
 * The Awtsmoos names each enduring vessel and each dissolving shadow;
 * Awtsmoos.com reads these lists without mixing policy data into judgment.
 */

const MAX_TRACKED_BYTES = 2 * 1024 * 1024;
const GENERATED_ROOTS = new Set([
	".ai-thoughts",
	"ai-thoughts",
	"ai_thoughts",
	".awtsmoos-agent-thoughts",
	".awtsmoos-artifacts",
	"traces",
	"inspection-shared-world"
]);
const GENERATED_SEGMENTS = new Set([
	".cache", ".logs", ".reports", "coverage", "logs", "node_modules",
	"reports", "screenshots", "temp", "tmp"
]);
const FORBIDDEN_SUFFIXES = [
	".apk", ".bak", ".cache", ".err", ".log", ".map", ".out",
	".rar", ".swp", ".tar", ".tar.gz", ".tgz", ".tmp", ".7z", ".zip"
];
const MEDIA_EXTENSIONS = new Set([
	".avi", ".bmp", ".flac", ".gif", ".glb", ".ico", ".jpeg", ".jpg",
	".m4a", ".mkv", ".mov", ".mp3", ".mp4", ".pdf", ".png", ".svg",
	".tif", ".tiff", ".wav", ".webm", ".webp"
]);
const APPROVED_MEDIA_PREFIXES = [
	"geelooy/games/mitzvahWorld/assets/",
	"geelooy/games/mitzvahWorld/movies/",
	"geelooy/games/mitzvahWorld/references/",
	"geelooy/apps/animator/tools/",
	"geelooy/apps/code/assets/",
	"geelooy/scripts/awtsmoos/MerkavaExecutor/",
	"geelooy/scripts/tricks/extensions/"
];
const APPROVED_FILES = new Set([
	"favicon.ico",
	"geelooy/favicon.ico",
	"geelooy/games/seven-mitzvos/favicon.svg",
	"geelooy/ai/relay/install/awtsmoos-server-extension.zip"
]);
const SOURCE_PREFIXES = [
	"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/logs/"
];

module.exports = {
	APPROVED_FILES,
	APPROVED_MEDIA_PREFIXES,
	FORBIDDEN_SUFFIXES,
	GENERATED_ROOTS,
	GENERATED_SEGMENTS,
	MAX_TRACKED_BYTES,
	MEDIA_EXTENSIONS,
	SOURCE_PREFIXES
};
