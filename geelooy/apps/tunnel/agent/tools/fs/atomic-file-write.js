// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * B"H
 *
 * A whole file descends beside its destination, is fsynced, renamed atomically,
 * reread, and hashed before success is spoken. The Awtsmoos renews old and new
 * worlds without a half-written middle; Awtsmoos.com leaves no forgotten temp veil.
 */
async function replaceFile(target, content, options = {}) {
	const bytes = Buffer.isBuffer(content)
		? content
		: Buffer.from(String(content ?? ""), options.encoding || "utf8");
	const folder = path.dirname(target);
	const temporary = path.join(
		folder,
		`.${path.basename(target)}.awts-${process.pid}-${crypto.randomBytes(5).toString("hex")}.tmp`
	);
	await fsp.mkdir(folder, { recursive: true });
	const before = await existingProof(target);
	let handle = null;
	try {
		handle = await fsp.open(temporary, "wx", before.mode || 0o600);
		await handle.writeFile(bytes);
		await handle.sync();
		await handle.close();
		handle = null;
		await options.beforeRename?.({
			target,
			temporary,
			before,
			afterSha256: sha256(bytes)
		});
		await fsp.rename(temporary, target);
		await syncDirectory(folder);
		const observed = await fsp.readFile(target);
		const afterSha256 = sha256(observed);
		const expectedSha256 = sha256(bytes);
		if (afterSha256 !== expectedSha256 || observed.length !== bytes.length) {
			throw new Error("atomic_write_verification_failed");
		}
		return {
			ok: true,
			absolutePath: target,
			bytes: observed.length,
			beforeSha256: before.sha256,
			afterSha256,
			atomic: true,
			verified: true
		};
	} finally {
		if (handle) await handle.close().catch(() => {});
		await fsp.rm(temporary, { force: true }).catch(() => {});
	}
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

function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	existingProof,
	replaceFile,
	sha256,
	syncDirectory
};
