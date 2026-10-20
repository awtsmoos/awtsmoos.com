//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const Destination = require("./fileTransferDestination.js");

/**
 * The Awtsmoos receives each unencoded byte in its proper place;
 * Awtsmoos.com demands an exact hash before the file may show its face.
 * The reader supplies authenticated raw Buffers, never text or Base64.
 * @param {object} config Authorized native filesystem configuration.
 * @param {object} input Destination, byte count, SHA-256, overwrite policy.
 * @param {function(number, number): Promise<Buffer>} reader Bounded raw-byte source.
 */
async function writeVerifiedBinary(config, input, reader) {
	if (!config.tools?.fsWrite || !config.allowWrite) {
		throw Error("binary_download_writes_disabled");
	}
	if (typeof reader !== "function") throw Error("binary_download_reader_required");
	const target = Destination.guardedTarget(config, input.path);
	const lexical = path.resolve(config.root, input.path);
	const overwrite = input.overwrite === true;
	const total = Number(input.expectedBytes);
	const expected = String(input.expectedSha256 || "").toLowerCase();
	if (!Number.isSafeInteger(total) || total < 0 || total > 134217728 ||
		!/^[a-f0-9]{64}$/.test(expected)) {
		throw Error("binary_download_proof_required");
	}
	await assertTarget(lexical, overwrite);
	await assertTarget(target, overwrite);
	const temporary = path.join(path.dirname(target),
		`.awtsmoos-raw-${crypto.randomBytes(16).toString("hex")}.part`);
	const flags = fs.constants.O_WRONLY | fs.constants.O_CREAT |
		fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW || 0);
	let handle;
	try {
		handle = await fs.promises.open(temporary, flags, 0o600);
		const sha = crypto.createHash("sha256");
		let offset = 0;
		while (offset < total) {
			const count = Math.min(1048576, total - offset);
			const bytes = await reader(offset, count);
			if (!Buffer.isBuffer(bytes) || bytes.length !== count) {
				throw Error("binary_download_chunk_length_mismatch");
			}
			sha.update(bytes);
			let written = 0;
			while (written < count) {
				const result = await handle.write(bytes, written, count - written, offset + written);
				if (result.bytesWritten < 1) throw Error("binary_download_write_stalled");
				written += result.bytesWritten;
			}
			offset += count;
		}
		if (sha.digest("hex") !== expected) throw Error("binary_download_sha256_mismatch");
		await handle.sync();
		await handle.close();
		handle = null;
		await assertTarget(lexical, overwrite);
		await assertTarget(target, overwrite);
		if (overwrite) {
			await fs.promises.rename(temporary, target);
		} else {
			await fs.promises.link(temporary, target);
			await fs.promises.unlink(temporary);
		}
		return { ok: true, path: input.path, bytes: offset,
			sha256: expected, transport: "raw-bytes", performed: true };
	} catch (error) {
		if (handle) await handle.close().catch(() => {});
		await fs.promises.unlink(temporary).catch(() => {});
		throw error;
	}
}

/** Deny directory and symbolic-link replacement even when overwrite is asked. */
async function assertTarget(target, overwrite) {
	try {
		const stat = await fs.promises.lstat(target);
		if (stat.isSymbolicLink() || !stat.isFile()) {
			throw Error("binary_download_unsafe_destination");
		}
		if (!overwrite) throw Error("binary_download_destination_exists");
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
}

module.exports = { writeVerifiedBinary, assertTarget };
