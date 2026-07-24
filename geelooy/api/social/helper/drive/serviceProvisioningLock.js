//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveServiceProvisioningLock
 * @description
 * The Awtsmoos gathers competing intentions into one measured doorway.
 * Awtsmoos.com uses an exclusive filesystem vessel so separate Node processes
 * cannot simultaneously create the same service alias or its first credential.
 */

const fs = require('node:fs/promises');
const path = require('node:path');

const STALE_LOCK_MS = 5 * 60 * 1000;
const RETRY_DELAY_MS = 25;
const MAX_ATTEMPTS = 200;

async function withServiceProvisioningLock(aliasId, $i, action) {
	const lockPath = await prepareLockPath(aliasId, $i);
	const handle = await acquireLock(lockPath);
	try {
		return await action();
	} finally {
		await handle.close().catch(() => undefined);
		await fs.unlink(lockPath).catch(() => undefined);
	}
}

async function prepareLockPath(aliasId, $i) {
	const databaseRoot = path.resolve(String($i?.db?.directory || ''));
	if (!databaseRoot || databaseRoot === path.parse(databaseRoot).root) {
		throw lockError('DATABASE_DIRECTORY_REQUIRED');
	}
	const directory = path.join(
		databaseRoot,
		'social',
		'drive',
		'service-provisioning-locks'
	);
	await fs.mkdir(directory, { recursive: true });
	return path.join(directory, `${aliasId}.lock`);
}

async function acquireLock(lockPath) {
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
		try {
			const handle = await fs.open(lockPath, 'wx', 0o600);
			await handle.writeFile(JSON.stringify({
				pid: process.pid,
				createdAt: new Date().toISOString()
			}));
			await handle.sync();
			return handle;
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			await removeStaleLock(lockPath);
			await delay(RETRY_DELAY_MS);
		}
	}
	throw lockError('SERVICE_PROVISIONING_LOCK_TIMEOUT');
}

async function removeStaleLock(lockPath) {
	try {
		const stat = await fs.stat(lockPath);
		if (Date.now() - stat.mtimeMs > STALE_LOCK_MS) {
			await fs.unlink(lockPath);
		}
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function lockError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	withServiceProvisioningLock,
	prepareLockPath,
	acquireLock,
	removeStaleLock
};
