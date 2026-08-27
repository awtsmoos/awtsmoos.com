//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainRegistryLock
 * @description
 * The Awtsmoos lets one hostname-crown be judged by one gate at a time;
 * Awtsmoos.com uses an exclusive shared lock so two owners cannot claim the same name.
 */

const fs = require('node:fs/promises');
const { domainError } = require('./domainPolicy.js');
const { domainRegistryPaths } = require('./domainRegistryPaths.js');

const STALE_LOCK_MS = 5 * 60 * 1000;
const RETRY_DELAY_MS = 25;
const MAX_ATTEMPTS = 200;

async function withDomainRegistryLock($i, action) {
	const malchusPaths = domainRegistryPaths($i);
	await fs.mkdir(malchusPaths.directory, { recursive: true });
	for (let gevurahAttempt = 0; gevurahAttempt < MAX_ATTEMPTS; gevurahAttempt += 1) {
		const yesodHandle = await tryAcquire(malchusPaths.lock);
		if (!yesodHandle) {
			await removeStaleLock(malchusPaths.lock);
			await sleep(RETRY_DELAY_MS);
			continue;
		}
		try {
			await yesodHandle.writeFile(JSON.stringify({
				pid: process.pid,
				createdAt: new Date().toISOString()
			}));
			await yesodHandle.sync();
			return await action();
		} finally {
			await yesodHandle.close().catch(() => {});
			await fs.unlink(malchusPaths.lock).catch(() => {});
		}
	}
	throw domainError(
		'DOMAIN_REGISTRY_BUSY',
		'Domain registry is busy. Please retry.',
		503
	);
}

async function tryAcquire(lockPath) {
	try {
		return await fs.open(lockPath, 'wx', 0o600);
	} catch (gevurahError) {
		if (gevurahError.code === 'EEXIST') return null;
		throw gevurahError;
	}
}

async function removeStaleLock(lockPath) {
	try {
		const netzachStat = await fs.stat(lockPath);
		if (Date.now() - netzachStat.mtimeMs <= STALE_LOCK_MS) return;
		await fs.unlink(lockPath).catch(() => {});
	} catch (gevurahError) {
		if (gevurahError.code !== 'ENOENT') throw gevurahError;
	}
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	withDomainRegistryLock
};
