// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file production_storage_plateau_stress_test.js
 * @chapter Repeated Creation And Retirement Must Reach A Verified Physical Plateau
 * @description
 * Drives deterministic high-entropy replacements, deletions, variable-sized values,
 * close/reopen cycles, allocation verification, and WAL cleanup through the public
 * verified-reuse facade. Growth after warmup is bounded by one workload generation.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-plateau-stress-'));
const databasePath = path.join(directory, 'plateau.awtsdb');
const walPath = `${databasePath}.wal`;
const sizes = [];

function bytes(key, round) {
	const length = 2048 + ((key * 257 + round * 619) % 8192);
	const output = Buffer.allocUnsafe(length);
	let state = (key + 1) * 0x9e3779b1 ^ round;
	for (let index = 0; index < length; index++) {
		state ^= state << 13;
		state ^= state >>> 17;
		state ^= state << 5;
		output[index] = state & 255;
	}
	return output;
}

function mutate(database, round) {
	database.batch(() => {
		for (let key = 0; key < 160; key++) {
			const name = `record-${key}`;
			if ((key + round) % 11 === 0) {
				delete database.root[name];
				continue;
			}
			database.root[name] = {
				key,
				round,
				payload: bytes(key, round),
				tags: [`group-${key % 13}`, `round-${round % 3}`]
			};
		}
	});
	database.waitForIdle();
	const verification = database.verify();
	assert.equal(verification.ok, true, `verification failed at round ${round}`);
	assert.equal(
		database.allocator.reuseVerification.state,
		'verified-complete-complement',
		`verified complement missing at round ${round}`
	);
	sizes.push(fs.statSync(databasePath).size);
}

function runRounds(start, end) {
	const database = new AwtsmoosDB(databasePath, {
		compression: false,
		turboWrites: false
	});
	try {
		database.open();
		assert.equal(database.options.reuseFreedSpace, 'verified');
		for (let round = start; round <= end; round++) mutate(database, round);
	} finally {
		database.close();
	}
	assert(!fs.existsSync(walPath) || fs.statSync(walPath).size === 0, 'WAL remained after clean close');
}

try {
	runRounds(0, 7);
	runRounds(8, 15);
	const warmMaximum = Math.max(...sizes.slice(3, 8));
	const finalMaximum = Math.max(...sizes.slice(8));
	const generationBudget = 2_500_000;
	assert(
		finalMaximum - warmMaximum < generationBudget,
		`post-warmup physical growth exceeded ${generationBudget}: ${finalMaximum - warmMaximum}`
	);
	const readOnly = new AwtsmoosDB(databasePath, { readOnly: true });
	try {
		readOnly.open();
		assert.equal(readOnly.verify().ok, true);
		assert.equal(readOnly.root['record-159'].round, 15);
	} finally {
		readOnly.close();
	}
	console.log('B"H production_storage_plateau_stress_test PASS', {
		initialBytes: sizes[0],
		finalBytes: sizes.at(-1),
		maximumBytes: Math.max(...sizes),
		postWarmupGrowth: finalMaximum - warmMaximum,
		sizes
	});
} finally {
	fs.rmSync(directory, { recursive: true, force: true });
}
