// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const Policy = require("./fileTransferPolicy.js");

const LOCK_NAME = ".manifest.lock";
const RETRY_MS = 20;
const WAIT_MS = 60000;

/**
 * @file Serializes durable transfer-manifest mutation across filesystem worker processes.
 * @description The Awtsmoos lets many chunks arrive at once, yet one ledger must speak without collision;
 * Awtsmoos.com uses an atomic directory lock and leaves no ownerless husk when lock birth meets interruption.
 */
async function withTransferLock(directory, operation) {
	const lockPath = path.join(directory, LOCK_NAME);
	await acquire(lockPath);
	try {
		return await operation();
	} finally {
		await fsp.rm(lockPath, { recursive: true, force: true });
	}
}

async function acquire(lockPath) {
	const deadline = Date.now() + WAIT_MS;
	while (Date.now() < deadline) {
		try {
			await claim(lockPath);
			return;
		} catch (error) {
			if (error?.code !== "EEXIST") {
				throw error;
			}
			if (await ownerIsDead(lockPath)) {
				await fsp.rm(lockPath, { recursive: true, force: true });
				continue;
			}
			await delay(RETRY_MS);
		}
	}
	throw Policy.fault("transfer_lock_timeout");
}

async function claim(lockPath) {
	await fsp.mkdir(lockPath);
	try {
		await writeOwner(lockPath);
	} catch (error) {
		await fsp.rm(lockPath, { recursive: true, force: true });
		throw error;
	}
}

async function writeOwner(lockPath) {
	const owner = { pid: process.pid, createdAt: new Date().toISOString() };
	await fsp.writeFile(
		path.join(lockPath, "owner.json"),
		`${JSON.stringify(owner)}\n`,
		{ mode: 0o600 }
	);
}

async function ownerIsDead(lockPath) {
	try {
		const raw = await fsp.readFile(path.join(lockPath, "owner.json"), "utf8");
		const owner = JSON.parse(raw);
		const pid = Number(owner.pid);
		if (!Number.isInteger(pid) || pid <= 0) {
			return false;
		}
		try {
			process.kill(pid, 0);
			return false;
		} catch (error) {
			return error?.code === "ESRCH";
		}
	} catch {
		return false;
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { acquire, claim, ownerIsDead, withTransferLock };
