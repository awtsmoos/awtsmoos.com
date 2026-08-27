//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file reconciliation.test.js
 * @description
 * The Awtsmoos tests whether logical sparks and immutable vessels agree.
 * Awtsmoos.com repairs counters only when every referenced object remains true.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const { mutateDriveState, readDriveState } = require('../stateRepository.js');
const {
	reportDriveReconciliation,
	repairDriveReconciliation
} = require('../reconciliationService.js');
const reconciliationRoutes = require('../routes/reconciliationRoutes.js');

async function write(aliasId, path, content, $i) {
	return writeDriveFile({ aliasId, path, content, $i });
}

test('reports healthy logical and physical usage with deduplicated objects', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-reconcile-healthy-');
	await write('alpha', 'a.txt', 'abc', $i);
	await write('alpha', 'b.txt', 'abc', $i);
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, true);
	assert.equal(report.logicalFilesChecked, 2);
	assert.equal(report.uniqueObjectsChecked, 1);
	assert.equal(report.expectedUsage.storedBytes, 6);
	assert.equal(report.expectedUsage.fileCount, 2);
	assert.equal(report.physicalBytes, 3);
});

test('repairs counter drift and removes expired transient state', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-reconcile-repair-');
	await write('alpha', 'truth.txt', 'truth', $i);
	await mutateDriveState('alpha', $i, state => {
		state.usage.storedBytes = 999;
		state.usage.fileCount = 99;
		state.reservations.expired = { expiresAt: Date.now() - 1 };
		state.transferLeases.expired = { expiresAt: Date.now() - 1 };
	});
	const result = await repairDriveReconciliation({
		aliasId: 'alpha',
		actorUserId: 'owner-1',
		$i
	});
	assert.equal(result.repaired, true);
	assert.equal(result.after.storedBytes, 5);
	assert.equal(result.after.fileCount, 1);
	assert.equal(result.after.reservations, 0);
	assert.equal(result.after.transferLeases, 0);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.events.at(-1).type, 'reconciliation.repair');
});

test('blocks repair when an object is missing', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-reconcile-missing-');
	await write('alpha', 'missing.txt', 'present', $i);
	await mutateDriveState('alpha', $i, state => {
		state.entries['missing.txt'].objectHash = 'f'.repeat(64);
	});
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, false);
	assert.equal(report.missingObjects.length, 1);
	await assert.rejects(
		repairDriveReconciliation({ aliasId: 'alpha', actorUserId: 'owner-1', $i }),
		error => error.code === 'RECONCILIATION_OBJECT_ERRORS'
	);
});

test('blocks repair when metadata size disagrees with immutable bytes', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-drive-reconcile-size-');
	await write('alpha', 'size.txt', 'four', $i);
	await mutateDriveState('alpha', $i, state => {
		state.entries['size.txt'].size = 40;
	});
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, false);
	assert.equal(report.sizeMismatches.length, 1);
});

test('reconciliation route rejects an unauthenticated bearer-less request', async () => {
	const $i = {
		request: { method: 'GET', headers: {}, user: {} },
		$_GET: {}
	};
	const handler = reconciliationRoutes({ $i, userid: null })
		['/drive/:aliasId/reconciliation'];
	const result = await handler({ aliasId: 'alpha' });
	assert.equal(result.statusCode, 401);
	assert.equal(JSON.parse(result.response).error.code, 'LOGIN_REQUIRED');
});
