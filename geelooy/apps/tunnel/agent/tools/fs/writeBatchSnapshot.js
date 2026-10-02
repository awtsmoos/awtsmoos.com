// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Hash = require("./fileTransferHash.js");
const { syncDirectory } = require("./atomic-file-write.js");

/**
 * @file Captures rollback state on disk instead of loading whole files into RAM.
 * @description
 * The Awtsmoos preserves the former world in a quiet sibling vessel. Awtsmoos.com
 * streams hashes, restores atomically, and removes every snapshot after success.
 */
async function captureSnapshot(target) {
	try {
		const stat = await fsp.lstat(target.absolutePath);
		if (stat.isDirectory()) throw targetError("write_target_is_directory", target);
		if (stat.isSymbolicLink()) throw targetError("write_target_symlink_not_allowed", target);
		const snapshotPath = siblingSnapshotPath(target.absolutePath);
		await fsp.copyFile(target.absolutePath, snapshotPath, fs.constants.COPYFILE_EXCL);
		const proof = await Hash.fileSha256(snapshotPath);
		return {
			...target,
			existed: true,
			snapshotPath,
			beforeSha256: proof.sha256,
			bytesBefore: proof.bytes,
			modeBefore: stat.mode & 0o777
		};
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		return {
			...target,
			existed: false,
			snapshotPath: null,
			beforeSha256: null,
			bytesBefore: 0,
			modeBefore: null
		};
	}
}

async function restoreSnapshot(snapshot, expectedAfterSha256) {
	const current = await currentHash(snapshot.absolutePath);
	if (current === snapshot.beforeSha256) {
		await cleanupSnapshot(snapshot);
		return { ok: true, path: snapshot.path, restored: "unchanged" };
	}
	if (!expectedAfterSha256 || current !== expectedAfterSha256) {
		throw targetError("rollback_conflict", snapshot);
	}
	if (!snapshot.existed) {
		await fsp.rm(snapshot.absolutePath, { force: true });
		return { ok: true, path: snapshot.path, restored: "removed_new_file" };
	}
	await fsp.rename(snapshot.snapshotPath, snapshot.absolutePath);
	await fsp.chmod(snapshot.absolutePath, snapshot.modeBefore);
	await syncDirectory(path.dirname(snapshot.absolutePath));
	return { ok: true, path: snapshot.path, restored: "previous_file_and_mode" };
}

async function cleanupSnapshot(snapshot) {
	if (!snapshot?.snapshotPath) return;
	await fsp.rm(snapshot.snapshotPath, { force: true }).catch(() => {});
}

async function currentHash(target) {
	try {
		const stat = await fsp.lstat(target);
		if (!stat.isFile()) throw new Error("rollback_target_changed_type");
		return (await Hash.fileSha256(target)).sha256;
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

function siblingSnapshotPath(target) {
	const token = crypto.randomBytes(6).toString("hex");
	return path.join(path.dirname(target), `.${path.basename(target)}.awts-batch-${process.pid}-${token}.snapshot`);
}

function targetError(code, target) {
	const error = new Error(`${code}: ${target.path}`);
	error.code = code;
	error.path = target.path;
	error.index = target.index;
	return error;
}

module.exports = {
	captureSnapshot,
	cleanupSnapshot,
	currentHash,
	restoreSnapshot,
	targetError
};
