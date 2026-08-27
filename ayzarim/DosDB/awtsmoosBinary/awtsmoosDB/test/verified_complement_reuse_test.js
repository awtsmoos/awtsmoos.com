// B"H

/**
 * @file test/verified_complement_reuse_test.js
 * @chapter The Full Verified Void Prevents Endless Generational Growth
 * @description Proves malicious-list safety, complement promotion, plateau reuse, and reopen persistence.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function token(index) {
	return `tokenx${index.toString(36)}`;
}

function row(index, phase) {
	return {
		id: `row-${index}-${phase}`,
		text: `common ${token(index)} phase${phase}`
	};
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-complement-reuse-'));
const dbPath = path.join(directory, 'reuse.awtsdb');
const sizes = [];
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.createList(db.root, 'records');
	for (let index = 0; index < 200; index++) db.root.records.push(row(index, 'zero'));
	db.search.enable(db.root.records);
	db.waitForIdle();
	assert(db.verify().ok, 'initial verification failed');

	for (let round = 1; round <= 6; round++) {
		db.batch(() => {
			for (let step = 0; step < 20; step++) {
				const index = step * 5;
				db.root.records[index] = row(index, round % 2 ? 'one' : 'two');
			}
		});
		assert(db.verify().ok, `round ${round} verification failed`);
		assert(db.allocator.reuseVerification.state === 'verified-complete-complement', `round ${round} complement was not trusted`);
		sizes.push(fs.statSync(dbPath).size);
	}

	const postWarmupGrowth = sizes[5] - sizes[1];
	assert(postWarmupGrowth < 150000, `post-warmup growth remained excessive: ${postWarmupGrowth}`);
	db.close();
	db = null;

	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	assert(db.verify().ok, 'reopen verification failed');
	assert(db.search.runIndexed(db.root.records, `${token(75)} phasetwo`)[0].id === 'row-75-two', 'reopen search changed');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H verified_complement_reuse_test PASS');
