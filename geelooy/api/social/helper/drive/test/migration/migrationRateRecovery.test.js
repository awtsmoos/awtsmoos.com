//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns a temporary rate wall into witnessed continuation;
 * Awtsmoos.com proves the receipt completes without concealing real failures.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	runMigrationImport
} = require('../../migration/migrationImporter.js');
const {
	createMigrationTestWorld,
	writeSourceFile,
	manifestForWorld
} = require('./testHelpers.js');

test('recovers a transient upload-rate denial inside one item attempt', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	await writeSourceFile(world.sourceRoot, 'paced/asset.txt', 'paced truth');
	const manifest = await manifestForWorld(world);
	let clock = 1000;
	let writeAttempts = 0;
	let written = false;
	const receipt = await runMigrationImport({
		runId: 'paced-rate-run',
		aliasId: 'service_alias',
		sourceRoot: world.sourceRoot,
		manifest,
		receiptRepository: world.repository,
		actorUserId: 'admin-user',
		requestId: 'paced-rate-run',
		rateControl: {
			uploadsPerMinute: 120,
			retryMarginMs: 10,
			now: () => clock,
			sleep: async milliseconds => { clock += milliseconds; }
		},
		$i: { db: { directory: world.root } }
	}, {
		writeFile: async () => {
			writeAttempts += 1;
			if (writeAttempts === 1) {
				const error = new Error('UPLOAD_RATE_EXCEEDED');
				error.code = 'UPLOAD_RATE_EXCEEDED';
				throw error;
			}
			written = true;
		},
		readSource: async () => Buffer.from('paced truth'),
		verifyDestination: async ({ item }) => {
			return written
				? { healthy: true, issues: [], entry: destinationEntry(item) }
				: { healthy: false, issues: ['DESTINATION_MISSING'], entry: null };
		}
	});
	const item = Object.values(receipt.items)[0];
	assert.equal(receipt.runState, 'completed');
	assert.equal(receipt.counters.verified, 1);
	assert.equal(receipt.counters.failed, 0);
	assert.equal(item.attempts, 1);
	assert.equal(item.transientRateRetries, 1);
	assert.equal(writeAttempts, 2);
	assert.equal(receipt.limitations.uploadRatePacing, true);
	assert.equal(receipt.limitations.uploadRequestsPerMinute, 120);
});

function destinationEntry(item) {
	return {
		path: item.destinationPath,
		type: 'file',
		ownerAlias: 'service_alias',
		objectHash: item.sha256,
		size: item.size,
		mime: item.mime,
		visibility: item.visibility,
		cachePolicy: item.cachePolicy,
		createdAt: '2026-07-26T00:00:00.000Z',
		updatedAt: '2026-07-26T00:00:00.000Z',
		trashedAt: null
	};
}
