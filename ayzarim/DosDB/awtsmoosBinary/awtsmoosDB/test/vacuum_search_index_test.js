// B"H

/**
 * @file test/vacuum_search_index_test.js
 * @chapter The Word Index Is Reborn From Destination Records
 * @description
 * Proves vacuum excludes pointer-bearing search storage, rebuilds it once, and
 * preserves query result identities after destination reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function ids(results) {
	return results.map(item => item.id).sort();
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-search-vacuum-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'candidate.awtsdb');
let source;
let destination;

try {
	source = new AwtsmoosDB(sourcePath, { compression: false, reuseFreedSpace: false });
	source.open();
	source.createList(source.root, 'library');
	source.root.library.push(
		{ id: 1, title: 'The Book of Light', content: 'Infinite light fills the void.' },
		{ id: 2, title: 'The Code', content: 'Code determines reality in the void.' },
		{ id: 3, title: 'Zohar', content: 'The book of radiance and light.' }
	);
	source.search.enable(source.root.library);
	source.waitForIdle();
	const expectedVoid = ids(source.search.run(source.root.library, 'void'));
	const expectedLight = ids(source.search.run(source.root.library, 'light'));
	source.close();
	source = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, { compression: false, cleanupOnFailure: true });
	assert(manifest.copyStats.rebuiltIndexes.search === 1, 'destination search index was not rebuilt');
	assert(manifest.comparison.ok, 'search-aware semantic comparison failed');

	destination = new AwtsmoosDB(destinationPath, { readOnly: true });
	destination.open();
	assert(JSON.stringify(ids(destination.search.run(destination.root.library, 'void'))) === JSON.stringify(expectedVoid), 'void search changed');
	assert(JSON.stringify(ids(destination.search.run(destination.root.library, 'light'))) === JSON.stringify(expectedLight), 'light search changed');
	assert(destination.verify().ok, 'destination search allocations did not verify');
} finally {
	if (destination) destination.close();
	if (source) source.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vacuum_search_index_test PASS');
