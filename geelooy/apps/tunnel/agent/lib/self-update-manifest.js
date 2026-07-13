// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

/**
 * B"H
 *
 * Parses one bounded covenant of safe relative paths. The exact original bytes
 * become the Malchus checksum published beside the ZIP; a separate BOM-free
 * view supplies orderly Binah parsing for Awtsmoos.com.
 *
 * @param {string} text
 * 	Exact remote manifest text received over the trusted update channel.
 * @returns {{version: string, entry: string, files: string[], lines: string[], hash: string}}
 * 	Validated manifest identity, safe paths, and exact-byte SHA-256.
 */
function parseManifest(text = "") {
	const exactSource = String(text);
	const parseSource = exactSource.replace(/^\uFEFF/, "");
	const lines = parseSource
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
	const version = lines[0] || "";
	const entry = lines[1] || "";
	const files = lines.slice(2).filter(isSafePath);

	if (!version || entry !== "main.js" || !files.length) {
		throw new Error("bad_remote_manifest");
	}

	return {
		version,
		entry,
		files,
		lines,
		hash: hashText(exactSource)
	};
}

/**
 * B"H
 *
 * Hashes exact text bytes without normalization, preserving the release
 * authority's checksum covenant.
 *
 * @param {string} text
 * 	Exact text whose bytes should be sealed.
 * @returns {string}
 * 	Lowercase hexadecimal SHA-256.
 */
function hashText(text = "") {
	return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function hashLines(lines = []) {
	return crypto.createHash("sha256").update(lines.join("\n")).digest("hex");
}

function isSafePath(filePath = "") {
	const normalized = String(filePath).replace(/\\/g, "/").trim();

	if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
		return false;
	}

	if (/\s/.test(normalized)) {
		return false;
	}

	const parts = normalized.split("/").filter(Boolean);
	return parts.length > 0 &&
		parts.join("/") === normalized &&
		!parts.some(part => (
			[".", "..", "node_modules", ".git", "__MACOSX"].includes(part) ||
			part.startsWith("._")
		));
}

async function allManifestFilesExist(root, manifest = {}) {
	if (!isSafePath(manifest.entry) || !fs.existsSync(path.join(root, manifest.entry))) {
		return false;
	}

	for (const file of manifest.files || []) {
		if (!fs.existsSync(path.join(root, file))) {
			return false;
		}
	}

	return true;
}

module.exports = {
	allManifestFilesExist,
	hashLines,
	hashText,
	isSafePath,
	parseManifest
};
