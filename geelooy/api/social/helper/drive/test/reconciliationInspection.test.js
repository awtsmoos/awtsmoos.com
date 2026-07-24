//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file reconciliationInspection.test.js
 * @description
 * The Awtsmoos reveals logical multiplicity through one immutable byte-vessel.
 * Awtsmoos.com proves deduplication never erases per-path accounting or drift.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { writeDriveFile } = require('../writeService.js');
const { mutateDriveState } = require('../stateRepository.js');
const { reportDriveReconciliation } = require('../reconciliationService.js');

test('counts logical copies while inspecting one deduplicated object', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-dedup-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'a.txt',
		content: 'abc',
		$i
	});
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'b.txt',
		content: 'abc',
		$i
	});
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, true);
	assert.deepEqual(report.expectedUsage, {
		storedBytes: 6,
		fileCount: 2
	});
	assert.equal(report.logicalFilesChecked, 2);
	assert.equal(report.uniqueObjectsChecked, 1);
	assert.equal(report.physicalBytes, 3);
});

test('reports durable counter drift without mutating state', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-drift-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'truth.txt',
		content: 'truth',
		$i
	});
	await mutateDriveState('alpha', $i, state => {
		state.usage.storedBytes = 1;
		state.usage.fileCount = 9;
	});
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, true);
	assert.deepEqual(report.observedUsage, {
		storedBytes: 1,
		fileCount: 9
	});
	assert.deepEqual(report.delta, {
		storedBytes: 4,
		fileCount: -8
	});
});

test('marks invalid object hashes unhealthy', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-reconcile-invalid-');
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'broken.txt',
		content: 'broken',
		$i
	});
	await mutateDriveState('alpha', $i, state => {
		state.entries['broken.txt'].objectHash = 'not-a-sha256';
	});
	const report = await reportDriveReconciliation({ aliasId: 'alpha', $i });
	assert.equal(report.healthy, false);
	assert.deepEqual(report.invalidEntries, [{
		path: 'broken.txt',
		objectHash: 'not-a-sha256'
	}]);
});
