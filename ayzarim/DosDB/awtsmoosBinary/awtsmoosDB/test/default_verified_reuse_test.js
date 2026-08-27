// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/default_verified_reuse_test.js
 * @chapter The Ordinary Door Reclaims Verified Hollows While Opt-Out Remains Real
 * @description
 * Compares identical replacement workloads under the public default and explicit
 * append-only compatibility mode, then proves strict read-only reopen preserves
 * every live value. Virtual test filesystems may report both growth values as zero.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-default-reuse-test-'));

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function payload(index, round) {
	return Buffer.alloc(3072 + (index % 5) * 96, (index + round) % 251);
}

function runWorkload(name, options) {
	const databasePath = path.join(directory, `${name}.awtsdb`);
	const database = new AwtsmoosDB(databasePath, { compression: false, ...options });
	try {
		database.open();
		database.batch(() => {
			for (let index = 0; index < 48; index++) database.root[`key-${index}`] = payload(index, 0);
		});
		database.waitForIdle();
		const initialBytes = fs.statSync(databasePath).size;
		for (let round = 1; round <= 6; round++) {
			database.batch(() => {
				for (let index = 0; index < 48; index++) database.root[`key-${index}`] = payload(index, round);
			});
			database.waitForIdle();
		}
		const finalBytes = fs.statSync(databasePath).size;
		assert(database.verify().ok, `${name} verifier failed`);
		return {
			databasePath,
			mode: database.options.reuseFreedSpace,
			initialBytes,
			finalBytes,
			growthBytes: finalBytes - initialBytes
		};
	} finally {
		database.close();
	}
}

function assertGrowth(defaultRun, appendOnlyRun) {
	if (appendOnlyRun.growthBytes === 0) {
		assert(defaultRun.growthBytes === 0, 'virtual growth accounting favored append-only mode');
		return;
	}
	assert(
		defaultRun.growthBytes * 2 < appendOnlyRun.growthBytes,
		`default reuse did not materially bound growth: ${defaultRun.growthBytes} vs ${appendOnlyRun.growthBytes}`
	);
}

try {
	const defaultRun = runWorkload('default', {});
	const appendOnlyRun = runWorkload('append-only', { reuseFreedSpace: false });
	assert(defaultRun.mode === 'verified', 'public default did not enable verified reuse');
	assert(appendOnlyRun.mode === false, 'explicit append-only opt-out was not preserved');
	assertGrowth(defaultRun, appendOnlyRun);
	const readOnly = new AwtsmoosDB(defaultRun.databasePath, { readOnly: true });
	try {
		readOnly.open();
		assert(readOnly.options.reuseFreedSpace === false, 'read-only mode did not disable reuse');
		assert(Buffer.isBuffer(readOnly.root['key-47']), 'read-only reopen lost a live value');
		assert(readOnly.root['key-47'].equals(payload(47, 6)), 'reopened live value changed');
	} finally {
		readOnly.close();
	}
	console.log('B"H default_verified_reuse_test PASS', { defaultRun, appendOnlyRun });
} finally {
	fs.rmSync(directory, { recursive: true, force: true });
}
