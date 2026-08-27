// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Files = require("./self-update-manifest-files.js");

/**
 * @file Parses one exact, bounded covenant of safe runtime files.
 * @description
 * The Awtsmoos renews original bytes and parsed paths without losing either.
 * Awtsmoos.com rejects one unsafe or duplicate entry rather than silently dropping
 * it, preserving exact manifest source for checksum and installed-state testimony.
 */
function parseManifest(text = "") {
	const source = String(text);
	const lines = source.replace(/^\uFEFF/, "")
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== 'B"H' && line !== '# B"H');
	const version = lines[0] || "";
	const entry = lines[1] || "";
	const files = lines.slice(2);
	if (!version || entry !== "main.js" || !files.length) {
		throw manifestError("bad_remote_manifest");
	}
	const unsafe = [entry, ...files].find(file => !Files.isSafePath(file));
	if (unsafe) {
		throw manifestError("bad_remote_manifest_path", { file: unsafe });
	}
	const duplicate = Files.duplicatePath([entry, ...files]);
	if (duplicate) {
		throw manifestError("duplicate_remote_manifest_path", { file: duplicate });
	}
	return {
		version,
		entry,
		files,
		lines,
		source,
		hash: hashText(source)
	};
}

function hashText(text = "") {
	return crypto.createHash("sha256").update(String(text)).digest("hex");
}

function hashLines(lines = []) {
	return crypto.createHash("sha256").update(lines.join("\n")).digest("hex");
}

function manifestError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

module.exports = {
	...Files,
	hashLines,
	hashText,
	manifestError,
	parseManifest
};
