// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Data = require("./policyData.cjs");

/**
 * @file Judges whether one tracked path belongs in the enduring Git vessel.
 * @description
 * The Awtsmoos separates source from shadow with named, testable reasons;
 * Awtsmoos.com preserves approved assets while generated burden fades away.
 */

function normalize(file) {
	return String(file || "").replace(/\\/g, "/").replace(/^\.\//, "");
}

function isApproved(file) {
	const normalized = normalize(file);
	return Data.APPROVED_FILES.has(normalized) ||
		Data.APPROVED_MEDIA_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

function isSourceException(file) {
	const normalized = normalize(file);
	return Data.SOURCE_PREFIXES.some(prefix => normalized.startsWith(prefix));
}

function isMedia(file) {
	return Data.MEDIA_EXTENSIONS.has(
		path.posix.extname(normalize(file)).toLowerCase()
	);
}

function classify(file, bytes = 0) {
	const normalized = normalize(file);
	const segments = normalized.split("/");
	const lower = normalized.toLowerCase();
	const reasons = [];

	if (isApproved(normalized)) {
		return reasons;
	}

	if (Data.GENERATED_ROOTS.has(segments[0])) {
		reasons.push("generated-root");
	}

	if (Data.GENERATED_PREFIXES.some(prefix => normalized.startsWith(prefix))) {
		reasons.push("generated-prefix");
	}

	if (!isSourceException(normalized) &&
		segments.some(segment => Data.GENERATED_SEGMENTS.has(segment))) {
		reasons.push("generated-directory");
	}

	if (segments.includes("dist") &&
		!normalized.startsWith("geelooy/apps/tunnel/")) {
		reasons.push("generated-dist");
	}

	if (Data.FORBIDDEN_SUFFIXES.some(suffix => lower.endsWith(suffix))) {
		reasons.push("forbidden-extension");
	}

	if (normalized.includes("/.sim/") && /\.(?:json|jsonl|log|out|err)$/.test(lower)) {
		reasons.push("generated-simulation-output");
	}

	if ((isMedia(normalized) || lower.endsWith(".gz")) &&
		!isApproved(normalized)) {
		reasons.push("unapproved-media");
	}

	if (path.posix.basename(normalized) === ".DS_Store") {
		reasons.push("system-metadata");
	}

	if (bytes > Data.MAX_TRACKED_BYTES && !isApproved(normalized)) {
		reasons.push("oversized-file");
	}

	return [...new Set(reasons)];
}

module.exports = {
	APPROVED_FILES: Data.APPROVED_FILES,
	APPROVED_MEDIA_PREFIXES: Data.APPROVED_MEDIA_PREFIXES,
	MAX_TRACKED_BYTES: Data.MAX_TRACKED_BYTES,
	SOURCE_PREFIXES: Data.SOURCE_PREFIXES,
	classify,
	isApproved,
	isMedia,
	isSourceException,
	normalize
};
