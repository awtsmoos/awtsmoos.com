//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const PathPayload = require("./fileOpsPathPayload.js");
const PathResults = require("./fileOpsPathResults.js");
const { assertNotSecret, safePath } = require("./pathGuard.js");

/**
 * @file Executes small filesystem path mutations only after concrete targets exist.
 * @description
 * The Awtsmoos renews each deed with truth between intention and effect; an empty
 * carrier may not wear the crown of success. Awtsmoos.com therefore rejects missing
 * targets before mutation, while preserving every accepted historical path carrier.
 */
async function mkdirp(config, payload = {}) {
	assertWritesEnabled(config);
	const paths = PathPayload.normalizePaths(payload);
	if (!paths.length) return PathResults.missingPath("mkdirp");
	const results = {};
	for (const requestedPath of paths) {
		const absolutePath = guardedPath(config, requestedPath);
		const existed = fs.existsSync(absolutePath);
		await fsp.mkdir(absolutePath, { recursive: true });
		results[requestedPath] = {
			ok: true,
			path: requestedPath,
			absolutePath,
			existed,
			created: !existed
		};
	}
	return PathResults.success("mkdirp", paths, results);
}

/** Creates one file only when absent, preserving historical ensureFile semantics. */
async function ensureFile(config, payload = {}) {
	assertWritesEnabled(config);
	const requestedPath = payload.path || payload.p;
	if (!requestedPath) return PathResults.missingPath("ensureFile");
	const absolutePath = guardedPath(config, requestedPath);
	const existed = fs.existsSync(absolutePath);
	if (!existed) {
		await fsp.mkdir(path.dirname(absolutePath), { recursive: true });
		await fsp.writeFile(absolutePath, String(payload.content || ""), "utf8");
	}
	const stat = await fsp.stat(absolutePath);
	return {
		ok: true,
		action: "ensureFile",
		path: requestedPath,
		absolutePath,
		existed,
		created: !existed,
		bytes: stat.size
	};
}

/** Touches one or more concrete paths and rejects an empty target set. */
async function touch(config, payload = {}) {
	assertWritesEnabled(config);
	const paths = PathPayload.normalizePaths(payload);
	if (!paths.length) return PathResults.missingPath("touch");
	const results = {};
	for (const requestedPath of paths) {
		const absolutePath = guardedPath(config, requestedPath);
		const existed = fs.existsSync(absolutePath);
		if (!existed) {
			await fsp.mkdir(path.dirname(absolutePath), { recursive: true });
			await fsp.writeFile(absolutePath, "", "utf8");
		}
		const now = new Date();
		await fsp.utimes(absolutePath, now, now);
		results[requestedPath] = {
			ok: true,
			action: "touch",
			path: requestedPath,
			absolutePath,
			existed,
			created: !existed
		};
	}
	return PathResults.success("touch", paths, results);
}

/** Rejects mutation whenever writes are disabled by policy or capability. */
function assertWritesEnabled(config) {
	if (config.allowWrite && config.tools.fsWrite) return;
	throw new Error("Writes disabled.");
}

/** Resolves one target through root confinement and secret-path policy. */
function guardedPath(config, requestedPath) {
	const absolutePath = safePath(config, requestedPath);
	assertNotSecret(config, absolutePath);
	return absolutePath;
}

module.exports = {
	ensureFile,
	mkdirp,
	normalizePaths: PathPayload.normalizePaths,
	touch
};
