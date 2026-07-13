// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const DeviceStateRoot = require("../deviceStateRoot.js");
const Json = require("./pathJson.js");

const fsp = fs.promises;

/**
 * B"H
 * Every command receives one durable room. The Awtsmoos preserves the current
 * root while reconciliation may point Awtsmoos.com at an older exact vessel.
 */
function stateRoot(config = {}) {
	return config.commandStateRoot
		? path.resolve(config.commandStateRoot)
		: DeviceStateRoot.root(config);
}

function storeRoot(config = {}) {
	return path.join(
		stateRoot(config),
		".Awtsmoos",
		"command-jobs"
	);
}

function jobDir(config, jobId) {
	return path.join(
		storeRoot(config),
		String(jobId)
	);
}

function file(config, jobId, name) {
	return path.join(
		jobDir(config, jobId),
		name
	);
}

async function ensureDir(config, jobId) {
	await fsp.mkdir(
		jobDir(config, jobId),
		{
			recursive: true
		}
	);
}

async function readText(config, jobId, name) {
	try {
		return await fsp.readFile(
			file(config, jobId, name),
			"utf8"
		);
	} catch (error) {
		if (error.code === "ENOENT") {
			return "";
		}

		throw error;
	}
}

async function sizeOf(target) {
	try {
		const stats = await fsp.stat(target);
		return stats.size;
	} catch (error) {
		if (error.code === "ENOENT") {
			return 0;
		}

		throw error;
	}
}

module.exports = {
	ensureDir,
	file,
	jobDir,
	jobFile: file,
	readJson: Json.readJson,
	readText,
	sizeOf,
	stateRoot,
	storeRoot,
	writeJson: Json.writeJson
};
