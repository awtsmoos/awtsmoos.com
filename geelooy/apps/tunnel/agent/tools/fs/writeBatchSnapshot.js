// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const { replaceFile, sha256 } = require("./atomic-file-write.js");

/**
	* @file Captures and restores one file for a multi-file write transaction.
	* @description
	* The Awtsmoos renews before and after without losing the former world. Awtsmoos.com
	* rejects directory and symlink destinations, keeps exact bytes and mode, and can
	* unwind every committed file when a later member of the batch fails.
	*/
async function captureSnapshot(target) {
	try {
		const stat = await fsp.lstat(target.absolutePath);
		if (stat.isDirectory()) throw targetError("write_target_is_directory", target);
		if (stat.isSymbolicLink()) throw targetError("write_target_symlink_not_allowed", target);
		return {
			...target,
			existed: true,
			bytesBefore: await fsp.readFile(target.absolutePath),
			modeBefore: stat.mode & 0o777
		};
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
		return {
			...target,
			existed: false,
			bytesBefore: null,
			modeBefore: null
		};
	}
}

async function restoreSnapshot(snapshot, expectedAfterSha256) {
	const current = await currentHash(snapshot.absolutePath);
	const before = snapshot.existed ? sha256(snapshot.bytesBefore) : null;
	if (current === before) return { ok: true, path: snapshot.path, restored: "unchanged" };
	if (!expectedAfterSha256 || current !== expectedAfterSha256) {
		throw targetError("rollback_conflict", snapshot);
	}
	if (!snapshot.existed) {
		if (await currentHash(snapshot.absolutePath) !== expectedAfterSha256) {
			throw targetError("rollback_conflict", snapshot);
		}
		await fsp.rm(snapshot.absolutePath, { force: true });
		return {
			ok: true,
			path: snapshot.path,
			restored: "removed_new_file"
		};
	}
	await replaceFile(snapshot.absolutePath, snapshot.bytesBefore, {
		beforeRename: async () => {
			if (await currentHash(snapshot.absolutePath) !== expectedAfterSha256) {
				throw targetError("rollback_conflict", snapshot);
			}
		}
	});
	await fsp.chmod(snapshot.absolutePath, snapshot.modeBefore);
	return {
		ok: true,
		path: snapshot.path,
		restored: "previous_bytes_and_mode"
	};
}

async function currentHash(target) {
	try {
		const stat = await fsp.lstat(target);
		if (!stat.isFile()) throw new Error("rollback_target_changed_type");
		return sha256(await fsp.readFile(target));
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
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
	restoreSnapshot,
	targetError
};
