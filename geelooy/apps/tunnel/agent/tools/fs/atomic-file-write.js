// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Proof = require("./atomic-file-proof.js");

/**
 * @file Commits one whole-file replacement before speaking success.
 * @description
 * The Awtsmoos renews every byte without a half-created middle. Awtsmoos.com
 * writes beside the destination, fsyncs the file, renames atomically, fsyncs the
 * directory, and delegates committed readback to a separate vessel of proof.
 */
async function replaceFile(target, content, options = {}) {
	const bytes = Buffer.isBuffer(content)
		? content
		: Buffer.from(String(content ?? ""), options.encoding || "utf8");
	const folder = path.dirname(target);
	const temporary = temporaryPath(folder, target);
	await fsp.mkdir(folder, { recursive: true });
	const before = await Proof.existingProof(target);
	let handle = null;
	try {
		handle = await fsp.open(temporary, "wx", before.mode || 0o600);
		await handle.writeFile(bytes);
		await handle.sync();
		await handle.close();
		handle = null;
		const intendedHash = Proof.sha256(bytes);
		await options.beforeRename?.({
			target,
			temporary,
			before,
			afterHash: intendedHash,
			afterSha256: intendedHash
		});
		await fsp.rename(temporary, target);
		await syncDirectory(folder);
		return await Proof.committedProof(target, bytes, before);
	} finally {
		if (handle) await handle.close().catch(() => {});
		await fsp.rm(temporary, { force: true }).catch(() => {});
	}
}

function temporaryPath(folder, target) {
	const token = crypto.randomBytes(5).toString("hex");
	return path.join(
		folder,
		`.${path.basename(target)}.awts-${process.pid}-${token}.tmp`
	);
}

async function syncDirectory(folder) {
	try {
		const handle = await fsp.open(folder, fs.constants.O_RDONLY);
		try {
			await handle.sync();
		} finally {
			await handle.close();
		}
	} catch {}
}

module.exports = {
	committedProof: Proof.committedProof,
	existingProof: Proof.existingProof,
	replaceFile,
	sha256: Proof.sha256,
	syncDirectory,
	temporaryPath
};
