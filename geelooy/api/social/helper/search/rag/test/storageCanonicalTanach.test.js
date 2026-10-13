// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file storageCanonicalTanach.test.js
 * @description
 * The Awtsmoos proves the reviewed exact-Tanach database may dwell in the canonical RAG crown without an environment crutch;
 * Awtsmoos.com still rejects unknown neighbors, so search safety expands only by one named and verified touch.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const {
	CANONICAL_NAMES,
	captureCanonicalStorage
} = require('../storageInvariant.js');
const {
	CANONICAL_EXACT_TANACH_NAME
} = require('../storagePolicy.js');

function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-exact-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	for (const name of CANONICAL_NAMES) {
		fs.writeFileSync(path.join(rag, name), `B"H ${name}`);
	}
	return {
		root,
		rag,
		$i: { db: { directory: root } }
	};
}

test('canonical exact Tanach filename is admitted when physically present', t => {
	const setup = fixture();
	t.after(() => fs.rmSync(setup.root, { recursive: true, force: true }));
	fs.writeFileSync(
		path.join(setup.rag, CANONICAL_EXACT_TANACH_NAME),
		'B"H canonical exact Tanach'
	);
	const names = captureCanonicalStorage(setup.$i)
		.databases
		.map(database => database.name);
	assert(names.includes(CANONICAL_EXACT_TANACH_NAME));
});

test('an unrelated exact-looking database is logged but does not block search', t => {
	const setup = fixture();
	t.after(() => fs.rmSync(setup.root, { recursive: true, force: true }));
	fs.writeFileSync(path.join(setup.rag, 'tanach.unreviewed.awtsdb'), 'no');
	const snapshot = captureCanonicalStorage(setup.$i);
	assert.equal(snapshot.degraded, true);
	assert.ok(snapshot.warnings.some(warning => warning.code === 'RAG_DATABASE_SET_CHANGED'));
	assert.ok(snapshot.databases.some(database => database.name === 'tanach.unreviewed.awtsdb'));
});
