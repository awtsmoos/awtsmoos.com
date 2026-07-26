//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives interrupted memory a durable guarded home;
 * Awtsmoos.com proves atomic mode, conflict refusal, and process serialization.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const { spawn } = require('node:child_process');
const {
	createMigrationTestWorld
} = require('./testHelpers.js');

function emptyManifest(fingerprint) {
	return {
		fingerprint,
		items: []
	};
}

test('writes a restrictive atomic receipt without leftover temporary files', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	await world.repository.createOrLoad({
		runId: 'atomic-run',
		aliasId: 'service_alias',
		manifest: emptyManifest('fingerprint-a')
	});
	const receiptPath = world.repository.receiptPath('atomic-run');
	const stat = await fs.stat(receiptPath);
	assert.equal(stat.mode & 0o777, 0o600);
	assert.deepEqual(
		(await fs.readdir(world.receiptRoot)).filter(name => name.endsWith('.tmp')),
		[]
	);
	assert.equal((await world.repository.read('atomic-run')).receiptVersion, 1);
});

test('refuses to overwrite a receipt with a conflicting manifest', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	await world.repository.createOrLoad({
		runId: 'conflict-run',
		aliasId: 'service_alias',
		manifest: emptyManifest('fingerprint-a')
	});
	await assert.rejects(() => world.repository.createOrLoad({
		runId: 'conflict-run',
		aliasId: 'service_alias',
		manifest: emptyManifest('fingerprint-b')
	}), { code: 'MIGRATION_MANIFEST_CONFLICT' });
});

test('serializes receipt updates across separate Node processes', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	await world.repository.createOrLoad({
		runId: 'cross-process-run',
		aliasId: 'service_alias',
		manifest: emptyManifest('cross-process-fingerprint')
	});
	const modulePath = require.resolve('../../migration/migrationReceiptRepository.js');
	const childSource = `
		const { MigrationReceiptRepository } = require(${JSON.stringify(modulePath)});
		const repository = new MigrationReceiptRepository(process.argv[1]);
		repository.update('cross-process-run', 'cross-process-fingerprint', async receipt => {
			const sequence = Number(receipt.sequence || 0);
			await new Promise(resolve => setTimeout(resolve, 80));
			receipt.sequence = sequence + 1;
			return receipt;
		}).catch(error => { console.error(error); process.exitCode = 1; });
	`;
	await Promise.all([
		runChild(childSource, world.receiptRoot),
		runChild(childSource, world.receiptRoot)
	]);
	assert.equal((await world.repository.read('cross-process-run')).sequence, 2);
});

function runChild(source, receiptRoot) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, ['-e', source, receiptRoot], {
			stdio: ['ignore', 'ignore', 'pipe']
		});
		let errorText = '';
		child.stderr.on('data', chunk => { errorText += chunk; });
		child.once('error', reject);
		child.once('exit', code => {
			if (code === 0) resolve();
			else reject(new Error(errorText || `Child exited ${code}`));
		});
	});
}
