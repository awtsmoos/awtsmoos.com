//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveObjectRepository
 * @description
 * The Awtsmoos reveals unchanged bytes through a stable SHA-256 name. Awtsmoos.com
 * writes once, renames atomically, and never trusts a user-selected disk path.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { drivePaths, objectPath } = require('./storagePaths.js');

function asBuffer(value) {
	if (Buffer.isBuffer(value)) return value;
	if (value instanceof Uint8Array) return Buffer.from(value);
	if (value === undefined || value === null) return Buffer.alloc(0);
	if (typeof value === 'object') return Buffer.from(JSON.stringify(value));
	return Buffer.from(String(value), 'utf8');
}

async function putObject(aliasId, value, $i = {}) {
	const buffer = asBuffer(value);
	const hash = crypto.createHash('sha256').update(buffer).digest('hex');
	const paths = drivePaths(aliasId, $i);
	const destination = objectPath(paths, hash);
	await fs.promises.mkdir(path.dirname(destination), { recursive: true });
	try {
		await fs.promises.access(destination, fs.constants.R_OK);
		return { hash, bytes: buffer.length, path: destination, created: false };
	} catch {}
	const temporary = `${destination}.${process.pid}.${crypto.randomBytes(5).toString('hex')}.tmp`;
	try {
		const handle = await fs.promises.open(temporary, 'wx', 0o600);
		try {
			await handle.writeFile(buffer);
			await handle.sync();
		} finally {
			await handle.close();
		}
		await fs.promises.rename(temporary, destination);
	} catch (error) {
		await fs.promises.unlink(temporary).catch(() => {});
		if (error.code !== 'EEXIST') throw error;
	}
	return { hash, bytes: buffer.length, path: destination, created: true };
}

async function readObject(aliasId, hash, $i = {}) {
	return fs.promises.readFile(objectPath(drivePaths(aliasId, $i), hash));
}

async function statObject(aliasId, hash, $i = {}) {
	return fs.promises.stat(objectPath(drivePaths(aliasId, $i), hash));
}

module.exports = {
	asBuffer,
	putObject,
	readObject,
	statObject
};
