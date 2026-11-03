//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importStorageAdmission.test.cjs
 * @description
 * The Awtsmoos lets tests shape a filesystem without consuming one grain of real disk;
 * Awtsmoos.com proves safe admission, low-capacity refusal, and compatibility when measurement is opaque.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	GIBIBYTE,
	inspectImportStorage,
	minimumFreeGiB
} = require('../importStorageAdmission.js');

const ORIGINAL_FLOOR = process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;

/** Build deterministic statfs facts for a requested number of free bytes. */
function statfsWithFreeBytes(freeBytes) {
	return () => ({
		bavail: Math.floor(freeBytes / 4096),
		bsize: 4096
	});
}

/** Restore the caller's environment after every capacity scenario. */
test.afterEach(() => {
	if (ORIGINAL_FLOOR === undefined) delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
	else process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = ORIGINAL_FLOOR;
});

test('healthy storage passes the default eight-GiB floor', () => {
	delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
	const result = inspectImportStorage(
		{ db: { directory: '/unused-test-root' } },
		statfsWithFreeBytes(9 * GIBIBYTE)
	);
	assert.equal(result.ok, true);
	assert.equal(result.measured, true);
	assert.equal(result.minimumFreeBytes, 8 * GIBIBYTE);
});

test('measured storage below the floor is rejected explicitly', () => {
	delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
	const result = inspectImportStorage(
		{ db: { directory: '/unused-test-root' } },
		statfsWithFreeBytes(GIBIBYTE)
	);
	assert.equal(result.error, 'IMPORT_STORAGE_LOW');
	assert.ok(result.freeBytes < result.minimumFreeBytes);
});

test('a positive operator override controls the admission floor', () => {
	process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = '0.5';
	const result = inspectImportStorage(
		{ db: { directory: '/unused-test-root' } },
		statfsWithFreeBytes(0.75 * GIBIBYTE)
	);
	assert.equal(minimumFreeGiB(), 0.5);
	assert.equal(result.ok, true);
});

test('unavailable statfs remains compatible with the durable write gate', () => {
	const result = inspectImportStorage(
		{ db: { directory: '/unused-test-root' } },
		() => { throw new Error('unsupported'); }
	);
	assert.deepEqual(result, { ok: true, measured: false });
});
