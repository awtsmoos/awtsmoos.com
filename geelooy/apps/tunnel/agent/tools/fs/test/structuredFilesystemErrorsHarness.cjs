// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Builds deterministic real filesystem-error vessels for Issue 12 regressions.
 * @description
 * The Awtsmoos reveals a guarded garden with one open branch and one barred branch;
 * Awtsmoos.com uses the operating system's own EACCES testimony, while canonical realpath
 * keeps macOS `/var` aliases from disguising a path that truly remains inside the test root.
 */
async function createGarden() {
	const created = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-fs-errors-"));
	const root = await fsp.realpath(created);
	await fsp.mkdir(path.join(root, "open"));
	await fsp.mkdir(path.join(root, "blocked"));
	await fsp.writeFile(path.join(root, "open", "visible.txt"), "B\"H visible");
	await fsp.writeFile(path.join(root, "blocked", "hidden.txt"), "hidden");
	await fsp.writeFile(path.join(root, ".env"), "SECRET=not-for-reading");
	return root;
}

/** Returns the smallest production-shaped permissions needed by the regression. */
function config(root) {
	return {
		root,
		allowSecrets: false,
		allowWrite: false,
		tools: {
			fsList: true,
			fsRead: true,
			fsTree: true
		}
	};
}

/** Temporarily turns one real directory into an operating-system permission failure. */
async function withBlockedDirectory(root, callback) {
	const blocked = path.join(root, "blocked");
	await fsp.chmod(blocked, 0);
	try {
		return await callback();
	} finally {
		await fsp.chmod(blocked, 0o700);
	}
}

/** Removes the entire temporary garden after restoring its permission vessel. */
async function remove(root) {
	const blocked = path.join(root, "blocked");
	try {
		await fsp.chmod(blocked, 0o700);
	} catch {}
	await fsp.rm(root, {
		force: true,
		recursive: true
	});
}

module.exports = {
	config,
	createGarden,
	remove,
	withBlockedDirectory
};
