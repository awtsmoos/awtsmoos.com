// B"H
// Boruch Hashem
// Blessed is He

/** @file stateLease.test.js @description Proves leases and orphan recovery. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	acquireLease,
	leaseFile
} = require('../maintenanceLease.js');
const {
	readState,
	writeState
} = require('../state.js');
const { recoverMutableState } = require('../stateRecovery.js');

function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-state-'));
	return {
		root,
		policy: { workRoot: root }
	};
}

test('a live lease refuses concurrent mutation', () => {
	const current = fixture();
	const release = acquireLease(current.policy, 'prepare');
	assert.throws(
		() => acquireLease(current.policy, 'finalize'),
		error => error.code === 'AWTSMOOS_MAINTENANCE_LEASE_ACTIVE'
	);
	release();
	assert.equal(fs.existsSync(leaseFile(current.policy)), false);
	fs.rmSync(current.root, { recursive: true, force: true });
});

test('a dead lease is archived and replaced', () => {
	const current = fixture();
	fs.writeFileSync(leaseFile(current.policy), JSON.stringify({
		pid: 99999999,
		operation: 'dead'
	}));
	const release = acquireLease(current.policy, 'prepare');
	const stale = fs.readdirSync(current.root)
		.filter(name => name.includes('.stale-'));
	assert.equal(stale.length, 1);
	release();
	fs.rmSync(current.root, { recursive: true, force: true });
});

test('orphaned building state returns to idle and removes partial work', () => {
	const current = fixture();
	const run = path.join(current.root, 'run-20260716T000000Z');
	fs.mkdirSync(run);
	fs.writeFileSync(path.join(run, 'partial.bin'), 'partial');
	writeState(current.policy, {
		status: 'building',
		pendingRunId: path.basename(run)
	});
	const recovered = recoverMutableState(
		current.policy,
		readState(current.policy)
	);
	assert.equal(recovered.recovered, true);
	assert.equal(recovered.state.status, 'idle');
	assert.equal(fs.existsSync(run), false);
	fs.rmSync(current.root, { recursive: true, force: true });
});