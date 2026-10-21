//B"H
//Blessed is He
//Boruch Hashem
/**
 * @file storageInvariantFixture.js
 * @description Fixture helpers extracted verbatim from storageInvariant.test.js.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { CANONICAL_NAMES } = require('../storageInvariant.js');

function productionFixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-rag-storage-'));
	const rag = path.join(root, 'ai', 'comment-rag');
	fs.mkdirSync(rag, { recursive: true });
	for (const name of CANONICAL_NAMES) {
		fs.writeFileSync(path.join(rag, name), `B"H ${name}`);
	}
	return { $i: { db: { directory: root } }, rag, root };
}

function withTanachIndex(value, action) {
	const previous = process.env.AWTSMOOS_TANACH_INDEX;
	if (value == null) delete process.env.AWTSMOOS_TANACH_INDEX;
	else process.env.AWTSMOOS_TANACH_INDEX = value;
	try {
		return action();
	} finally {
		if (previous == null) delete process.env.AWTSMOOS_TANACH_INDEX;
		else process.env.AWTSMOOS_TANACH_INDEX = previous;
	}
}

function cleanup(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

module.exports = { productionFixture, withTanachIndex, cleanup };