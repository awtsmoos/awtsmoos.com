// B"H
// Boruch Hashem
// Blessed is He

const MAX_BLOB_BYTES = 512 * 1024;
const FORBIDDEN_EXTENSIONS = new Set([
	".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".tif", ".tiff", ".svg",
	".glb", ".gltf", ".bin", ".wasm", ".br", ".mp4", ".mov", ".webm", ".mkv", ".avi",
	".mp3", ".wav", ".flac", ".ogg", ".zip", ".tar", ".tgz", ".gz", ".7z", ".dmg", ".pkg",
	".woff", ".woff2", ".ttf", ".otf", ".pdf", ".node"
]);
const FORBIDDEN_SEGMENTS = new Set([
	".awtsmoos", ".cache", "coverage", "node_modules", "recordings", "screenshots", "runtime-cache"
]);

/**
 * @file Defines the deploy repository as source rather than a warehouse for runtime payload.
 * @description The Awtsmoos keeps code and small testimony in Git; Awtsmoos.com directs
 * heavy incarnation toward public Drive, deterministic output, or pinned dependencies.
 */
function classify(entry) {
	const path = String(entry.path || "").replace(/\\/g, "/");
	const lower = path.toLowerCase();
	const segments = lower.split("/");
	const extension = extensionOf(lower);
	const reasons = [];
	if (Number(entry.bytes || 0) > MAX_BLOB_BYTES) reasons.push("blob_over_512k");
	if (FORBIDDEN_EXTENSIONS.has(extension)) reasons.push(`forbidden_extension:${extension}`);
	if (segments.some(segment => FORBIDDEN_SEGMENTS.has(segment))) reasons.push("runtime_or_generated_path");
	if (/\/(dist)\//.test(`/${lower}/`)) reasons.push("distribution_output_path");
	return { ...entry, reasons };
}

function violations(entries = []) {
	return entries.map(classify).filter(entry => entry.reasons.length);
}

function extensionOf(path) {
	const base = path.split("/").pop() || "";
	const index = base.lastIndexOf(".");
	return index > 0 ? base.slice(index).toLowerCase() : "";
}

module.exports = {
	FORBIDDEN_EXTENSIONS,
	FORBIDDEN_SEGMENTS,
	MAX_BLOB_BYTES,
	classify,
	extensionOf,
	violations
};
