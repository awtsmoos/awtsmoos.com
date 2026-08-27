// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

/**
 * @file Reads and replaces manifest, checksum, and version state in commit order.
 * @description
 * The Awtsmoos renews release bytes before naming the version complete. Awtsmoos.com
 * writes three temporary witnesses, renames manifest and checksum first, and exposes
 * the new version only after every preceding state file has reached its destination.
 */
function createState(root) {
	const resolvedRoot = path.resolve(root);
	return {
		root: resolvedRoot,
		versionPath: path.join(resolvedRoot, "install-state.txt"),
		hashPath: path.join(resolvedRoot, "install-manifest.sha256"),
		manifestPath: path.join(resolvedRoot, "installed-manifest.txt"),
		lockPath: path.join(resolvedRoot, ".self-update.lock")
	};
}

function readLocalState(state) {
	return {
		version: readTrim(state.versionPath),
		hash: readTrim(state.hashPath).split(/\s+/)[0] || "",
		manifest: readTrim(state.manifestPath)
	};
}

async function writeLocalState(state, manifest) {
	await fsp.mkdir(state.root, { recursive: true });
	const source = manifest.source ?? `${manifest.lines.join("\n")}\n`;
	const writes = [
		[state.manifestPath, source],
		[state.hashPath, `${manifest.hash}  installed-manifest.txt\n`],
		[state.versionPath, `${manifest.version}\n`]
	].map(([target, content]) => ({
		target,
		content,
		temporary: `${target}.${process.pid}.${Date.now()}.tmp`
	}));
	try {
		for (const item of writes) {
			await fsp.writeFile(item.temporary, item.content, { mode: 0o600 });
		}
		for (const item of writes) await fsp.rename(item.temporary, item.target);
	} catch (error) {
		await Promise.all(writes.map(item => (
			fsp.rm(item.temporary, { force: true }).catch(() => {})
		)));
		throw error;
	}
}

function readTrim(filePath) {
	try { return fs.readFileSync(filePath, "utf8").trim(); }
	catch { return ""; }
}

module.exports = {
	createState,
	readLocalState,
	readTrim,
	writeLocalState
};
