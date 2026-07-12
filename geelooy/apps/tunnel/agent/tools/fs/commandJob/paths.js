// B"H
const crypto = require('node:crypto');
const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const { root: deviceStateRoot } = require('../deviceStateRoot.js');

/** B"H — Every job owns one directory beneath the device-scoped state root. */
function storeRoot(config = {}) {
	return path.join(deviceStateRoot(config), '.Awtsmoos', 'command-jobs');
}

function jobDir(config, jobId) {
	return path.join(storeRoot(config), String(jobId));
}

function file(config, jobId, name) {
	return path.join(jobDir(config, jobId), name);
}

async function ensureDir(config, jobId) {
	await fsp.mkdir(jobDir(config, jobId), { recursive: true });
}

async function writeJson(filePath, value) {
	await fsp.mkdir(path.dirname(filePath), { recursive: true });
	const nonce = crypto.randomBytes(6).toString('hex');
	const temporary = `${filePath}.${process.pid}.${Date.now()}.${nonce}.tmp`;
	const handle = await fsp.open(temporary, 'wx', 0o600);
	try {
		await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`, 'utf8');
		await handle.sync();
	} finally {
		await handle.close();
	}
	await fsp.rename(temporary, filePath);
	return value;
}

async function readJson(filePath, fallback = null) {
	try {
		return JSON.parse(await fsp.readFile(filePath, 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') return fallback;
		throw error;
	}
}

async function readText(config, jobId, name) {
	try {
		return await fsp.readFile(file(config, jobId, name), 'utf8');
	} catch (error) {
		if (error.code === 'ENOENT') return '';
		throw error;
	}
}

module.exports = {
	ensureDir,
	file,
	jobDir,
	readJson,
	readText,
	storeRoot,
	writeJson
};
