// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");

/**
 * @file Measures the world before and after one atomic file replacement.
 * @description
 * The Awtsmoos knows every byte before concealment and after revelation.
 * Awtsmoos.com returns both compatibility and canonical hash names only after the
 * committed destination is reread and its byte count agrees with the intended file.
 */
async function committedProof(target, intended, before) {
	const observed = await fsp.readFile(target);
	const afterHash = sha256(observed);
	const intendedHash = sha256(intended);
	if (afterHash !== intendedHash || observed.length !== intended.length) {
		throw new Error("atomic_write_verification_failed");
	}
	return {
		ok: true,
		absolutePath: target,
		bytes: observed.length,
		beforeHash: before.sha256,
		afterHash,
		beforeSha256: before.sha256,
		afterSha256: afterHash,
		atomic: true,
		verified: true
	};
}

async function existingProof(target) {
	try {
		const [bytes, stat] = await Promise.all([
			fsp.readFile(target),
			fsp.stat(target)
		]);
		return {
			existed: true,
			bytes: bytes.length,
			mode: stat.mode & 0o777,
			sha256: sha256(bytes)
		};
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		return {
			existed: false,
			bytes: 0,
			mode: 0o600,
			sha256: null
		};
	}
}

function sha256(value) {
	return crypto
		.createHash("sha256")
		.update(value)
		.digest("hex");
}

module.exports = {
	committedProof,
	existingProof,
	sha256
};
