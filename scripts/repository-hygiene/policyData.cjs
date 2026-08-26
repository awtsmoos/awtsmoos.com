// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the immutable borders of the repository hygiene covenant.
 * @description
 * The Awtsmoos keeps source in Git while image bodies live only in remote dayuhChadash/Drive;
 * Awtsmoos.com preserves names, code and metadata here, never local pixels smuggled inside.
 */

const MAX_TRACKED_BYTES = 2 * 1024 * 1024;
const GENERATED_ROOTS = new Set([
	".ai-thoughts", "ai-thoughts", "ai_thoughts", ".awtsmoos-agent-thoughts",
	".awtsmoos-artifacts", "traces", "inspection-shared-world"
]);
const GENERATED_SEGMENTS = new Set([
	".ai-thoughts", ".cache", ".logs", ".reports", "__pycache__", "coverage",
	"logs", "node_modules", "reports", "review-output", "screenshots",
	"simulator-results", "temp", "tmp"
]);
const GENERATED_PREFIXES = [
	".ai_tmp_",
	".awtsmoos-",
	"geelooy/apps/animator/tools/browser-export/assets/voices/",
	"geelooy/apps/animator/tools/review-output/",
	"geelooy/games/scribe-journey/tests/simulator-results/"
];
const FORBIDDEN_SUFFIXES = [
	".aif", ".aiff", ".apk", ".bak", ".cache", ".err", ".log", ".map",
	".out", ".pyc", ".pyo", ".rar", ".swp", ".tar", ".tar.gz", ".tgz",
	".tmp", ".7z", ".zip"
];
const IMAGE_EXTENSIONS = new Set([
	".avif", ".bmp", ".dds", ".exr", ".gif", ".hdr", ".heic", ".heif",
	".ico", ".jpeg", ".jpg", ".ktx", ".ktx2", ".png", ".svg", ".tif",
	".tiff", ".webp"
]);
const MEDIA_EXTENSIONS = new Set([
	...IMAGE_EXTENSIONS,
	".aif", ".aiff", ".avi", ".flac", ".glb", ".gltf", ".m4a", ".mkv",
	".mov", ".mp3", ".mp4", ".pdf", ".wav", ".webm"
]);
const APPROVED_MEDIA_PREFIXES = [
	"geelooy/apps/code/assets/",
	"geelooy/games/seven-mitzvos/assets/models/reference-world/",
	"geelooy/scripts/awtsmoos/MerkavaExecutor/"
];
const APPROVED_FILES = new Set([
	"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js"
]);
const SOURCE_PREFIXES = [
	"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/diagnostics/logs/"
];

module.exports = {
	APPROVED_FILES,
	APPROVED_MEDIA_PREFIXES,
	FORBIDDEN_SUFFIXES,
	GENERATED_PREFIXES,
	GENERATED_ROOTS,
	GENERATED_SEGMENTS,
	IMAGE_EXTENSIONS,
	MAX_TRACKED_BYTES,
	MEDIA_EXTENSIONS,
	SOURCE_PREFIXES
};
