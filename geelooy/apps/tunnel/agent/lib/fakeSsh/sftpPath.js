// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical path and write-budget law for tunnel-agent fake SSH storage.
 * @description
 * The Awtsmoos lets a virtual name approach physical bytes only through the same
 * canonical project-root gate Awtsmoos.com already trusts. Secret veils, mutation
 * permission, and finite byte measures meet here before any SFTP verb may rhyme.
 */
const { assertNotSecret, safePath } = require("../../tools/fs/pathGuard.js");
const Shell = require("./shell.js");

const MAX_WRITE_BYTES = 32 * 1024 * 1024;

function resolve(config, cwd, target, options = {}) {
	const resolved = Shell.resolve(config, cwd, target);
	const invalid = resolved.error ||
		(!options.allowSynthetic && resolved.synthetic) ||
		(!resolved.synthetic && !resolved.real);
	if (invalid) {
		throw new Error(resolved.error || "synthetic_path_not_mutable");
	}
	if (!resolved.synthetic) {
		resolved.real = safePath(config, resolved.real);
		assertNotSecret(config, resolved.real);
	}
	return resolved;
}

function requireWrite(config) {
	if (!config.allowWrite) {
		throw new Error("write_not_allowed");
	}
}

function assertWriteSize(content) {
	const bytes = Buffer.isBuffer(content)
		? content.length
		: content instanceof Uint8Array
			? content.byteLength
			: Buffer.byteLength(String(content || ""));
	if (bytes > MAX_WRITE_BYTES) {
		throw new Error(`fake_ssh_file_too_large:${bytes}`);
	}
	return bytes;
}

module.exports = {
	MAX_WRITE_BYTES,
	assertWriteSize,
	requireWrite,
	resolve
};
