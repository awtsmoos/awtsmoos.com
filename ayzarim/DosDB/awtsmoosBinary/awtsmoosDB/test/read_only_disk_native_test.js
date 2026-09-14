//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ReadOnlyDiskNativeMemoryLawTest
 * @description
 * Builds a multi-leaf B-tree, reopens it through the strict read-only pager, and
 * proves exact/range lookup remains disk-addressed: no pager mirror/cache exists,
 * only a bounded number of physical reads occur, and no individual read approaches
 * a corpus-sized allocation.
 */

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-disk-native-'));
const FILE = path.join(ROOT, 'memory-law.awtsdb');
const ROWS = 900;

/** Creates enough sorted keys to force multiple persisted B-tree leaves. */
async function buildDatabase() {
	const database = new AwtsmoosDB(FILE, {
		maxCachedPages: 16,
		dirtyPageFlushThreshold: 8,
		wal: false
	});
	await database.open();
	database.root.rows = new database.Map();
	for (let index = 0; index < ROWS; index += 1) {
		const key = `word_${String(index).padStart(4, '0')}`;
		await database.root.rows.set(key, `value_${index}`);
	}
	await database.waitForIdle();
	await database.close();
}
/** Reopens through the zero-cache reader and records physical read behavior. */
async function proveReadOnlyLaw() {
	const database = new AwtsmoosDB(FILE, { readOnly: true });
	await database.open();
	assert.equal(database.pager.memoryBytes(), 0);
	let reads = 0;
	let bytes = 0;
	let maximumRead = 0;
	const original = database.pager.readExact;
	database.pager.readExact = (offset, length) => {
		reads += 1;
		bytes += length;
		maximumRead = Math.max(maximumRead, length);
		return original(offset, length);
	};
	const exact = await database.root.rows.get('word_0450');
	assert.equal(exact, 'value_450');
	const ranged = [];
	for await (const row of database.range(database.root.rows, 'word_0450', 'word_0454')) {
		ranged.push(String(row.key));
	}
	assert.deepEqual(ranged, ['word_0450', 'word_0451', 'word_0452', 'word_0453', 'word_0454']);
	assert(reads < 80, `too many physical reads: ${reads}`);
	assert(bytes < 4 * 1024 * 1024, `too many bytes read: ${bytes}`);
	assert(maximumRead < 1024 * 1024, `single read too large: ${maximumRead}`);
	assert.equal(database.pager.memoryBytes(), 0);
	await database.close();
	return { reads, bytes, maximumRead };
}

async function run() {
	try {
		await buildDatabase();
		const report = await proveReadOnlyLaw();
		console.log(`B"H disk-native memory law passed reads=${report.reads} bytes=${report.bytes} max=${report.maximumRead}`);
	} finally {
		fs.rmSync(ROOT, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
