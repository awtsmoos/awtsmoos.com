//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos counts logical vessels while one physical spark may be shared;
 * Awtsmoos.com proves migration accounting for deduplication, overwrite, and abort.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { runMigrationImport } = require('../../migration/migrationImporter.js');
const { readDriveState } = require('../../stateRepository.js');
const { writeDriveFile } = require('../../writeService.js');
const { drivePaths } = require('../../storagePaths.js');
const {
	createMigrationTestWorld,
	writeSourceFile,
	manifestForWorld
} = require('./testHelpers.js');

async function accountingOptions(testContext, runId, aliasId = 'accounting_alias') {
	const world = await createMigrationTestWorld(testContext);
	const $i = { db: { directory: path.join(world.root, 'drive-state') } };
	return {
		world,
		options: {
			runId,
			aliasId,
			sourceRoot: world.sourceRoot,
			receiptRepository: world.repository,
			actorUserId: 'admin-user',
			$i
		}
	};
}

test('counts duplicate logical files while storing one physical object', async testContext => {
	const { world, options } = await accountingOptions(testContext, 'dedup-run');
	const content = Buffer.from('same physical object');
	await writeSourceFile(world.sourceRoot, 'a.txt', content);
	await writeSourceFile(world.sourceRoot, 'nested/b.txt', content);
	options.manifest = await manifestForWorld(world);
	const receipt = await runMigrationImport(options);
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(receipt.counters.verified, 2);
	assert.equal(state.usage.fileCount, 2);
	assert.equal(state.usage.storedBytes, content.length * 2);
	assert.equal(await countFiles(drivePaths(options.aliasId, options.$i).objects), 1);
});

test('replaces overwrite bytes exactly without increasing file count', async testContext => {
	const { world, options } = await accountingOptions(testContext, 'overwrite-run');
	await writeSourceFile(world.sourceRoot, 'replace.txt', 'new');
	options.manifest = await manifestForWorld(world);
	await writeDriveFile({
		aliasId: options.aliasId,
		path: 'replace.txt',
		content: 'much longer old content',
		actorUserId: 'admin-user',
		$i: options.$i
	});
	await runMigrationImport(options);
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(state.usage.fileCount, 1);
	assert.equal(state.usage.storedBytes, Buffer.byteLength('new'));
});

test('does not consume quota when an import aborts before canonical write', async testContext => {
	const { world, options } = await accountingOptions(testContext, 'abort-run');
	await writeSourceFile(world.sourceRoot, 'abort.txt', 'never written');
	options.manifest = await manifestForWorld(world);
	await runMigrationImport(options, {
		writeFile: async () => {
			const error = new Error('ABORTED');
			error.code = 'ABORTED';
			throw error;
		}
	});
	const state = await readDriveState(options.aliasId, options.$i);
	assert.equal(state.usage.fileCount, 0);
	assert.equal(state.usage.storedBytes, 0);
});

async function countFiles(directory) {
	let count = 0;
	for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
		const target = path.join(directory, entry.name);
		count += entry.isDirectory() ? await countFiles(target) : Number(entry.isFile());
	}
	return count;
}
