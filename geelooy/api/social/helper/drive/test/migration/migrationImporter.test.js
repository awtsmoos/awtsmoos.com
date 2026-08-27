//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries each item through failure, resumption, and renewed proof;
 * Awtsmoos.com skips only healthy destinations and reimports every drifted one.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { runMigrationImport } = require('../../migration/migrationImporter.js');
const { writeDriveFile } = require('../../writeService.js');
const {
	createMigrationTestWorld,
	writeSourceFile,
	manifestForWorld
} = require('./testHelpers.js');

async function importOptions(testContext, runId = 'migration-run') {
	const world = await createMigrationTestWorld(testContext);
	await writeSourceFile(world.sourceRoot, 'nested/asset.txt', 'canonical asset');
	const manifest = await manifestForWorld(world);
	return {
		world,
		options: {
			runId,
			aliasId: 'service_alias',
			sourceRoot: world.sourceRoot,
			manifest,
			receiptRepository: world.repository,
			actorUserId: 'admin-user',
			requestId: runId,
			$i: { db: { directory: path.join(world.root, 'drive-state') } }
		}
	};
}

test('resumes interruption and completes the failed item', async testContext => {
	const { options } = await importOptions(testContext, 'resume-run');
	const interrupted = await runMigrationImport(options, {
		writeFile: async () => {
			const error = new Error('INTERRUPTED_IMPORT');
			error.code = 'INTERRUPTED_IMPORT';
			throw error;
		}
	});
	assert.equal(interrupted.runState, 'failed');
	assert.equal(interrupted.counters.failed, 1);
	const resumed = await runMigrationImport(options);
	assert.equal(resumed.runState, 'completed');
	assert.equal(resumed.counters.verified, 1);
	assert.equal(Object.values(resumed.items)[0].attempts, 2);
});

test('skips a verified item and reimports it after destination drift', async testContext => {
	const { options } = await importOptions(testContext, 'drift-run');
	const first = await runMigrationImport(options);
	assert.equal(first.counters.verified, 1);
	const skipped = await runMigrationImport(options);
	assert.equal(skipped.counters.skipped, 1);
	await writeDriveFile({
		aliasId: options.aliasId,
		path: 'nested/asset.txt',
		content: 'destination drift',
		mime: 'text/plain; charset=utf-8',
		visibility: 'public',
		cachePolicy: 'immutable',
		actorUserId: 'admin-user',
		requestId: 'drift-write',
		$i: options.$i
	});
	const repaired = await runMigrationImport(options);
	assert.equal(repaired.counters.verified, 1);
	assert.equal(Object.values(repaired.items)[0].attempts, 2);
});

test('does not complete an item when destination verification fails', async testContext => {
	const { options } = await importOptions(testContext, 'verification-run');
	const receipt = await runMigrationImport(options, {
		writeFile: async () => ({ ok: true }),
		verifyDestination: async () => ({
			healthy: false,
			issues: ['PHYSICAL_SIZE_MISMATCH'],
			entry: null
		})
	});
	assert.equal(receipt.runState, 'failed');
	assert.equal(receipt.counters.failed, 1);
	assert.deepEqual(Object.values(receipt.items)[0].error.issues, [
		'PHYSICAL_SIZE_MISMATCH'
	]);
});
