// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookWorkerLease
 * @description One persistent lease serializes heavy book generation across detached workers.
 */
const fs = require('fs');
const path = require('path');
const { exportRoot } = require('./paths.js');

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function leaseFile() {
	return path.join(exportRoot(), '.generation.lock');
}

function processAlive(pid) {
	if (!Number.isInteger(pid) || pid <= 0) return false;
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

function readLease() {
	try {
		return JSON.parse(fs.readFileSync(leaseFile(), 'utf8'));
	} catch {
		return null;
	}
}

function removeStale(owner) {
	if (!owner || processAlive(Number(owner.pid))) return false;
	try {
		fs.unlinkSync(leaseFile());
		return true;
	} catch {
		return false;
	}
}

function tryAcquire(jobId) {
	fs.mkdirSync(exportRoot(), { recursive: true });
	const payload = { jobId, pid: process.pid, acquiredAt: Date.now() };
	try {
		const handle = fs.openSync(leaseFile(), 'wx', 0o600);
		fs.writeFileSync(handle, `${JSON.stringify(payload)}\n`);
		fs.closeSync(handle);
		return payload;
	} catch (error) {
		if (error.code !== 'EEXIST') throw error;
		return null;
	}
}

async function acquire(jobId, onWait = () => {}) {
	let lastNotice = 0;
	for (;;) {
		const lease = tryAcquire(jobId);
		if (lease) return lease;
		const owner = readLease();
		if (removeStale(owner)) continue;
		if (Date.now() - lastNotice > 15000) {
			onWait(owner);
			lastNotice = Date.now();
		}
		await sleep(2000);
	}
}

function release(jobId) {
	const owner = readLease();
	if (!owner || owner.jobId !== jobId || Number(owner.pid) !== process.pid) return false;
	try {
		fs.unlinkSync(leaseFile());
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	acquire,
	leaseFile,
	processAlive,
	readLease,
	release,
	tryAcquire
};
