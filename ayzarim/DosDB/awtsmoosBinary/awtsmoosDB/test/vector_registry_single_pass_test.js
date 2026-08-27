// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file vector_registry_single_pass_test.js
 * @chapter One Persisted Sequence Traversal Must Preserve Every HNSW Node Seal
 * @description
 * Builds a disposable indexed list, reopens it, and proves the single-pass registry
 * reader preserves node count, payload identity, indexed search, and restart safety.
 */

const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-registry-pass-'));
const file = path.join(directory, 'registry.awtsdb');
const records = Array.from({ length: 96 }, (_, id) => ({
	id,
	vec: vectorFor(id)
}));

function vectorFor(id) {
	const vector = new Array(8).fill(0);
	vector[id % vector.length] = 1;
	vector[(id + 3) % vector.length] = id / 1000;
	return vector;
}

function build() {
	const database = new AwtsmoosDB(file, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	try {
		database.open();
		database.createList(database.root, 'vectors');
		database.root.vectors.splice(0, 0, ...records);
		database.vector.enable(database.root.vectors, {
			dimensions: 8,
			metric: 'cosine'
		});
		database.waitForIdle();
		const audit = database.vector.auditIndex(database.root.vectors);
		assert.equal(audit.ok, true);
		assert.equal(audit.registryCount, records.length);
	} finally {
		database.close();
	}
}

function reopen() {
	const database = new AwtsmoosDB(file, { readOnly: true });
	try {
		database.open();
		const list = database.root.vectors;
		const index = database.vector.getIndex(list);
		assert(index);
		index.registry.init();
		assert.equal(index.registry.count(), records.length);
		for (let id = 0; id < records.length; id++) {
			const node = index.registry.getNode(id);
			assert.equal(node.id, id);
			assert.equal(node.deleted, false);
		}
		const hits = database.vector.nearestIndexed(list, records[37].vec, 5);
		assert(hits.some(hit => hit.item.id === 37));
		assert(hits.every(hit => Boolean(hit.item)));
	} finally {
		database.close();
	}
}

try {
	build();
	reopen();
	console.log('vector_registry_single_pass_test passed');
} finally {
	fs.rmSync(directory, { recursive: true, force: true });
}
