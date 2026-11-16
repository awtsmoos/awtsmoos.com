// B"H

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const SelfContained = require("../../../lib/selfContained.js");
const { importHttpModule } = require("./runtimeRemoteModules.js");

/**
 * @file Resolves the Merkava service from the nearest trustworthy vessel.
 * @description
 * The Awtsmoos reveals source in development, the sealed installed bundle in
 * production, and only then the distant network. Awtsmoos.com walks that order
 * so API execution and installation share one reality instead of parallel myths.
 */
function findLocalMerkavaService(start) {
	const candidates = [];
	let directory = path.resolve(start || process.cwd());
	while (directory && directory !== path.dirname(directory)) {
		candidates.push(path.join(
			directory,
			"geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"
		));
		candidates.push(path.join(
			directory,
			"scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js"
		));
		directory = path.dirname(directory);
	}
	return candidates.find(file => fs.existsSync(file)) || null;
}

async function importFile(file) {
	return import(`${pathToFileURL(file).href}?awtsmoos=${Date.now()}`);
}

async function loadInstalledService() {
	const root = await SelfContained.ensureBundle("merkava");
	const service = path.join(
		root,
		"scripts",
		"awtsmoos",
		"MerkavaExecutor",
		"merkava-service",
		"index.js"
	);
	if (!fs.existsSync(service)) {
		throw new Error(`installed_merkava_service_missing:${service}`);
	}
	return importFile(service);
}

function resolveRemoteServiceUrl(payload = {}) {
	const base = payload.origin
		|| payload.url
		|| process.env.AWTSMOOS_BASE_URL
		|| "https://awtsmoos.com";
	return new URL(
		"/scripts/awtsmoos/MerkavaExecutor/merkava-service/index.js",
		base
	).href;
}

async function loadMerkavaService(payload = {}, config = {}) {
	const local = findLocalMerkavaService(config.root || process.cwd());
	if (local) return importFile(local);
	try {
		return await loadInstalledService();
	} catch (installedError) {
		try {
			return await importHttpModule(resolveRemoteServiceUrl(payload));
		} catch (remoteError) {
			remoteError.installedMerkavaError = installedError.message;
			throw remoteError;
		}
	}
}

module.exports = {
	findLocalMerkavaService,
	loadMerkavaService,
	loadInstalledService
};
