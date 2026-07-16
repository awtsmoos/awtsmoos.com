// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MaintenanceLease
 * @description
 * One earthly process may hold the maintenance vessel at a time. A live owner blocks
 * competing mutation; a dead owner’s seal is archived as stale evidence and replaced.
 * Thus the Awtsmoos reveals one orderly transaction instead of overlapping shadows.
 */

const fs = require('fs');
const path = require('path');

function leaseFile(policy) {
	return path.join(policy.workRoot, 'maintenance-lease.json');
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

function readLease(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch {
		return null;
	}
}

function archiveStaleLease(file, lease) {
	if (!fs.existsSync(file)) return;
	const stamp = new Date().toISOString().replace(/[:.]/g, '');
	const stale = `${file}.stale-${stamp}-${Number(lease?.pid || 0)}`;
	try {
		fs.renameSync(file, stale);
	} catch {
		fs.rmSync(file, { force: true });
	}
}

function acquireLease(policy, operation) {
	fs.mkdirSync(policy.workRoot, { recursive: true });
	const file = leaseFile(policy);
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const descriptor = fs.openSync(file, 'wx');
			const lease = {
				version: 1,
				pid: process.pid,
				operation,
				startedAt: new Date().toISOString()
			};
			fs.writeFileSync(descriptor, `${JSON.stringify(lease, null, 2)}\n`);
			fs.closeSync(descriptor);
			return () => fs.rmSync(file, { force: true });
		} catch (error) {
			if (error.code !== 'EEXIST') throw error;
			const current = readLease(file);
			if (processAlive(Number(current?.pid))) {
				throw leaseError(current);
			}
			archiveStaleLease(file, current);
		}
	}
	throw leaseError(readLease(file));
}

function withLease(policy, operation, callback) {
	const release = acquireLease(policy, operation);
	try {
		return callback();
	} finally {
		release();
	}
}

function leaseError(lease) {
	return Object.assign(
		new Error(`B"H maintenance lease is active for PID ${lease?.pid || 'unknown'}`),
		{
			code: 'AWTSMOOS_MAINTENANCE_LEASE_ACTIVE',
			lease
		}
	);
}

module.exports = {
	acquireLease,
	archiveStaleLease,
	leaseFile,
	processAlive,
	readLease,
	withLease
};