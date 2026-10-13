//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file directSeriesPrateem.test.js
 * @description
 * The Awtsmoos proves the fast series vessel falls back to the legacy record
 * when the packed vessel is missing or a bare transfer placeholder — and
 * that a truly unregistered series still resolves to SERIES_NOT_FOUND.
 * Real temp directory for the series DB root (absent file); stub $i.db.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { getDirectSeriesPrateem } = require('../directSeriesPrateem.js');
const { clearCache } = require('../../packed/keyIndex.js');

function tempDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-prateem-'));
}

function stubInterface(dir, legacyPrateem) {
	return {
		request: { method: 'GET' },
		$_GET: {},
		db: {
			directory: dir,
			get: async target => {
				if (target.endsWith('/prateem')) {
					if (legacyPrateem === undefined) {
						const e = new Error('Path does not exist');
						throw e;
					}
					return legacyPrateem;
				}
				throw new Error('Path does not exist');
			}
		}
	};
}

test('legacy fallback answers when the packed vessel is absent', async () => {
	const dir = tempDir();
	try {
		const $i = stubInterface(dir, { id: 's1', name: 'Legacy Name', description: 'd' });
		const result = await getDirectSeriesPrateem({ $i, heichelId: 'h1', seriesId: 's1' });
		assert.ok(!result.error, `unexpected error: ${JSON.stringify(result.error)}`);
		assert.equal(result.id, 's1');
		assert.equal(result.prateem.name, 'Legacy Name');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
		clearCache();
	}
});

test('unregistered series resolves to SERIES_NOT_FOUND, not a crash', async () => {
	const dir = tempDir();
	try {
		const $i = stubInterface(dir, undefined);
		const result = await getDirectSeriesPrateem({ $i, heichelId: 'h1', seriesId: 'nope' });
		assert.ok(result.error);
		assert.equal(result.error.code, 'SERIES_NOT_FOUND');
		assert.deepEqual(result.error.details, { heichelId: 'h1', seriesId: 'nope' });
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
		clearCache();
	}
});

test('transfer placeholder in legacy record yields identity only', async () => {
	const dir = tempDir();
	try {
		const $i = stubInterface(dir, { type: 'Buffer', data: [32] });
		const result = await getDirectSeriesPrateem({ $i, heichelId: 'h1', seriesId: 's9' });
		assert.ok(!result.error);
		assert.deepEqual(result.prateem, { id: 's9' });
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
		clearCache();
	}
});
