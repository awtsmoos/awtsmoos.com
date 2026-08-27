//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationRollbackTests
 * @description
 * The Awtsmoos returns only the path a receipt can prove;
 * Awtsmoos.com preserves neighbors and refuses to erase later destination truth.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { runMigrationImport } = require('../../migration/migrationImporter.js');
const { runMigrationRollback } = require('../../migration/migrationRollback.js');
const { readDriveState } = require('../../stateRepository.js');
const { writeDriveFile } = require('../../writeService.js');
const {
	createMigrationTestWorld,
	writeSourceFile,
	manifestForWorld
} = require('./testHelpers.js');

async function rollbackWorld(testContext, runId) {
	const world = await createMigrationTestWorld(testContext);
	const $i = { db: { directory: path.join(world.root, 'drive-state') } };
	await writeSourceFile(world.sourceRoot, 'imported.txt', 'imported truth');
	const manifest = await manifestForWorld(world);
	return {
		world,
		options: {
			runId,
			aliasId: 'rollback_alias',
			sourceRoot: world.sourceRoot,
			manifest,
			receiptRepository: world.repository,
			actorUserId: 'admin-user',
			requestId: runId,
			$i
		}
	};
}

test('removes only a receipt-proven new path and preserves its neighbor', async testContext => {
	const { options } = await rollbackWorld(testContext, 'new-file-rollback');
	await writeDriveFile({
		aliasId: options.aliasId,
		path: 'neighbor.txt',
		content: 'neighbor remains',
		actorUserId: 'admin-user',
		requestId: 'neighbor-write',
		$i: options.$i
	});
	await runMigrationImport(options);
	const receipt = await runMigrationRollback(options);
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(receipt.runState, 'rolled-back');
	assert.equal(receipt.counters.rolledBack, 1);
	assert.equal(state.entries['imported.txt'], undefined);
	assert.equal(state.entries['neighbor.txt'].size, Buffer.byteLength('neighbor remains'));
	assert.equal(state.usage.fileCount, 1);
});

test('restores exact previous metadata and logical accounting after overwrite', async testContext => {
	const { options } = await rollbackWorld(testContext, 'overwrite-rollback');
	await writeDriveFile({
		aliasId: options.aliasId,
		path: 'imported.txt',
		content: 'previous destination content',
		visibility: 'private',
		cachePolicy: 'mutable',
		actorUserId: 'admin-user',
		requestId: 'previous-write',
		$i: options.$i
	});
	const before = (await readDriveState(options.aliasId, options.$i)).entries['imported.txt'];
	await runMigrationImport(options);
	await runMigrationRollback(options);
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(state.entries['imported.txt'].objectHash, before.objectHash);
	assert.equal(state.entries['imported.txt'].visibility, 'private');
	assert.equal(state.usage.fileCount, 1);
	assert.equal(state.usage.storedBytes, before.size);
});

test('refuses rollback after the imported destination drifts', async testContext => {
	const { options } = await rollbackWorld(testContext, 'drifted-rollback');
	await runMigrationImport(options);
	await writeDriveFile({
		aliasId: options.aliasId,
		path: 'imported.txt',
		content: 'later user change',
		actorUserId: 'admin-user',
		requestId: 'later-change',
		$i: options.$i
	});
	const receipt = await runMigrationRollback(options);
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(receipt.runState, 'failed');
	assert.equal(receipt.counters.failed, 1);
	assert.equal(state.entries['imported.txt'].size, Buffer.byteLength('later user change'));
});
