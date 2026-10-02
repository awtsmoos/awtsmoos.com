// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Atomic = require("./atomic-file-write.js");
const Hash = require("./fileTransferHash.js");

/**
 * @file Publishes a staged file through an atomic sibling copy without consuming its source.
 * @description
 * The Awtsmoos keeps the proven upload intact while Awtsmoos.com prepares a neighboring vessel;
 * size and SHA stream before and after rename so large batch writes stay disk-native and truthful.
 */
async function copyAtomic(source, target, expected = {}) {
	const folder = path.dirname(target);
	const temporary = Atomic.temporaryPath(folder, target);
	await fsp.mkdir(folder, { recursive: true });
	try {
		await fsp.copyFile(source, temporary, fs.constants.COPYFILE_EXCL);
		await Hash.syncFile(temporary);
		assertProof(await Hash.fileSha256(temporary), expected);
		await fsp.rename(temporary, target);
		await Atomic.syncDirectory(folder);
		const committed = await Hash.fileSha256(target);
		assertProof(committed, expected);
		return {
			ok: true,
			absolutePath: target,
			bytes: committed.bytes,
			afterHash: committed.sha256,
			afterSha256: committed.sha256,
			atomic: true,
			verified: true,
			sourcePreserved: true
		};
	} finally {
		await fsp.rm(temporary, { force: true }).catch(() => {});
	}
}

function assertProof(proof, expected = {}) {
	if (expected.bytes !== undefined && proof.bytes !== Number(expected.bytes)) {
		throw fault("staged_transfer_size_mismatch");
	}
	if (expected.sha256 && proof.sha256 !== String(expected.sha256).toLowerCase()) {
		throw fault("staged_transfer_hash_mismatch");
	}
}

function fault(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	assertProof,
	copyAtomic
};
