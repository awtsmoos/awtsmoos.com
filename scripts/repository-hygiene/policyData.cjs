// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds the immutable borders of the repository hygiene covenant.
 * @description
 * The Awtsmoos keeps source in Git and sends rendered shadows away in flight;
 * Awtsmoos.com preserves only named production vessels whose ownership is bright.
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
	".ai-thoughts", ".cache", ".logs", ".reports", "coverage", "logs",
	"node_modules", "reports", "review-output", "screenshots",
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
	".out", ".rar", ".swp", ".tar", ".tar.gz", ".tgz", ".tmp", ".7z",
	".zip"
];
const MEDIA_EXTENSIONS = new Set([
	".aif", ".aiff", ".avi", ".bmp", ".flac", ".gif", ".glb", ".gltf",
	".ico", ".jpeg", ".jpg", ".m4a", ".mkv", ".mov", ".mp3", ".mp4",
	".pdf", ".png", ".svg", ".tif", ".tiff", ".wav", ".webm", ".webp"
]);
const APPROVED_MEDIA_PREFIXES = [
	"geelooy/apps/code/assets/",
	"geelooy/games/seven-mitzvos/assets/models/reference-world/",
	"geelooy/scripts/awtsmoos/MerkavaExecutor/"
];
const APPROVED_FILES = new Set([
	"geelooy/games/mitzvahWorld/experiments/Awtsmoos/src/mitzvah-world.compact.js",
	"geelooy/games/seven-mitzvos/favicon.svg",
	"geelooy/resources/home/restored-awtsmoos-hero.jpg"
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
	MAX_TRACKED_BYTES,
	MEDIA_EXTENSIONS,
	SOURCE_PREFIXES
};
