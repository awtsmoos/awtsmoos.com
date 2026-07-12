// B"H
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

/** B"H — Update state and lock ownership are explicit filesystem receipts. */
function createState(root) {
	return {
		root,
		versionPath: path.join(root, 'install-state.txt'),
		hashPath: path.join(root, 'install-manifest.sha256'),
		manifestPath: path.join(root, 'installed-manifest.txt'),
		lockPath: path.join(root, '.self-update.lock')
	};
}

function readLocalState(state) {
	return {
		version: readTrim(state.versionPath),
		hash: readTrim(state.hashPath),
		manifest: readTrim(state.manifestPath)
	};
}

async function writeLocalState(state, manifest) {
	await fsp.writeFile(state.versionPath, `${manifest.version}\n`, 'utf8');
	await fsp.writeFile(state.hashPath, `${manifest.hash}\n`, 'utf8');
	await fsp.writeFile(state.manifestPath, `${manifest.lines.join('\n')}\n`, 'utf8');
}

async function acquireLock(state) {
	try {
		await fsp.writeFile(state.lockPath, `${process.pid}\n${Date.now()}\n`, { flag: 'wx' });
		return true;
	} catch {
		const age = Date.now() - Number(readTrim(state.lockPath).split(/\s+/)[1] || 0);
		if (age <= 2 * 60 * 1000) return false;
		await fsp.rm(state.lockPath, { force: true }).catch(() => {});
		return acquireLock(state);
	}
}

async function releaseLock(state) {
	await fsp.rm(state.lockPath, { force: true }).catch(() => {});
}

function readTrim(filePath) {
	try { return fs.readFileSync(filePath, 'utf8').trim(); }
	catch { return ''; }
}

module.exports = {
	acquireLock,
	createState,
	readLocalState,
	readTrim,
	releaseLock,
	writeLocalState
};
