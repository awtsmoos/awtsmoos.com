// B"H

/**
 * @file test/vacuum_out_of_place_test.js
 * @chapter The Old Vessel Remains Sealed While The New One Is Proven
 * @description
 * Creates deliberate unreachable bloat, rewrites only logical live data into a
 * new file, relocates ABLB/ATXT bodies, and proves source immutability and exact
 * semantic equality after reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-vacuum-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'candidate.awtsdb');
const manifestPath = path.join(directory, 'candidate.manifest.json');
const hebrew = 'ברוך הבא אל העולם המתחדש';
let db;

try {
	db = new AwtsmoosDB(sourcePath, { compression: false, reuseFreedSpace: false });
	db.open();
	const blob = db.blob.create(Buffer.from('binary-body-that-must-move'), { kind: 'fixture' });
	const text = db.text.create(`${hebrew} — reachable English text`, { chunkChars: 7 });
	db.root.payload = {
		hebrew,
		english: 'reachable English',
		array: [1, undefined, { nested: true }],
		map: new Map([['first', { value: 1 }], ['second', Buffer.from('two')]]),
		set: new Set(['aleph', 'beis']),
		date: new Date('2026-07-12T00:00:00.000Z'),
		typed: new Uint16Array([1, 255, 4096]),
		blob,
		text
	};
	db.root.discarded = Buffer.alloc(2 * 1024 * 1024, 9);
	delete db.root.discarded;
	db.close();
	db = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, {
		compression: false,
		manifestPath,
		cleanupOnFailure: true
	});
	assert(manifest.sourceUnchanged, 'source evidence changed');
	assert(manifest.comparison.ok, 'semantic comparison failed');
	assert(manifest.comparison.digestEqual, 'semantic digest mismatch');
	assert(manifest.isolatedCandidateReady, 'candidate was not marked ready for isolated review');
	assert(manifest.productionEligible === false, 'vacuum bypassed external production gates');
	assert(manifest.bytesSaved > 1024 * 1024, 'deliberate unreachable bloat was not removed');
	assert(fs.existsSync(manifestPath), 'vacuum manifest was not written');

	db = new AwtsmoosDB(destinationPath, { readOnly: true });
	db.open();
	assert(db.root.payload.hebrew === hebrew, 'Hebrew text changed');
	assert(db.root.payload.map.get('first').value === 1, 'Map content changed');
	assert(db.root.payload.set.has('beis'), 'Set content changed');
	assert(db.blob.read(db.root.payload.blob).toString() === 'binary-body-that-must-move', 'blob body changed');
	assert(db.text.read(db.root.payload.text).includes('reachable English text'), 'chunked text changed');
	assert(db.verify().ok, 'candidate pointer verification failed');
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vacuum_out_of_place_test PASS');
