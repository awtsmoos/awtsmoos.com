//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file reconciliationRepair.test.js
 * @description
 * The Awtsmoos restores measured counters only when every byte-vessel bears
 * faithful witness. Awtsmoos.com refuses repair that could conceal corruption.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const {
	readDriveState,
	mutateDriveState
} = require('../stateRepository.js');
const {
	repairDriveReconciliation
} = require('../reconciliationService.js');

async function createFile($i, content = 'truth') {
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'truth.txt',
		content,
		$i
	});
}

test('repairs drift and prunes expired transient state under one lock', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-repair-');
	await createFile($i);
	await mutateDriveState('alpha', $i, state => {
		state.usage.storedBytes = 1;
		state.usage.fileCount = 7;
		state.reservations.expired = {
			path: 'old.txt',
			expiresAt: Date.now() - 1
		};
		state.transferLeases.expired = {
			kind: 'download',
			expiresAt: Date.now() - 1
		};
	});
	const result = await repairDriveReconciliation({
		aliasId: 'alpha',
		actorUserId: 'owner-1',
		requestId: 'repair-1',
		$i
	});
	assert.equal(result.repaired, true);
	assert.deepEqual(result.after, {
		storedBytes: 5,
		fileCount: 1,
		reservations: 0,
		transferLeases: 0
	});
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 5);
	assert.equal(state.usage.fileCount, 1);
	assert.equal(state.events.at(-1).type, 'reconciliation.repair');
});

test('refuses repair when a referenced object is missing', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-missing-');
	await createFile($i);
	await mutateDriveState('alpha', $i, state => {
		state.entries['truth.txt'].objectHash = 'a'.repeat(64);
		state.usage.storedBytes = 0;
	});
	await assert.rejects(
		repairDriveReconciliation({ aliasId: 'alpha', $i }),
		error => {
			assert.equal(error.code, 'RECONCILIATION_OBJECT_ERRORS');
			assert.equal(error.report.missingObjects.length, 1);
			return true;
		}
	);
	assert.equal((await readDriveState('alpha', $i)).usage.storedBytes, 0);
});

test('refuses repair when metadata size disagrees with physical bytes', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-size-');
	await createFile($i, 'four');
	await mutateDriveState('alpha', $i, state => {
		state.entries['truth.txt'].size = 99;
	});
	await assert.rejects(
		repairDriveReconciliation({ aliasId: 'alpha', $i }),
		error => {
			assert.equal(error.code, 'RECONCILIATION_OBJECT_ERRORS');
			assert.equal(error.report.sizeMismatches.length, 1);
			return true;
		}
	);
});
