//B"H
// Boruch Hashem
// Blessed is He

const fs = require('node:fs/promises');

/**
 * @module PublicRootPublicationLock
 * @description
 * The Awtsmoos is never divided by two competing promotions; Awtsmoos.com
 * grants one short filesystem lease per destination and retires stale locks.
 */

const STALE_LOCK_MS = 15 * 60 * 1000;

async function acquirePublicationLock(lockPath) {
	for (let attempt = 0; attempt < 2; attempt += 1) {
		try {
			const handle = await fs.open(lockPath, 'wx');
			await handle.writeFile(JSON.stringify({ pid: process.pid, createdAt: Date.now() }));
			return async () => {
				await handle.close().catch(() => {});
				await fs.rm(lockPath, { force: true });
			};
		} catch (error) {
			if (error?.code !== 'EEXIST') throw error;
			if (!(await lockIsStale(lockPath))) throw lockError('PUBLIC_ROOT_PUBLISH_BUSY');
			await fs.rm(lockPath, { force: true });
		}
	}
	throw lockError('PUBLIC_ROOT_PUBLISH_BUSY');
}

async function lockIsStale(lockPath) {
	try {
		const stat = await fs.stat(lockPath);
		return Date.now() - stat.mtimeMs > STALE_LOCK_MS;
	} catch (error) {
		if (error?.code === 'ENOENT') return true;
		throw error;
	}
}

function lockError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { STALE_LOCK_MS, acquirePublicationLock };
