//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file storageInvariantFixture.js
 * @description Creates bounded storage fixtures without leaking into a developer's real runtime roots.
 *
 * The Awtsmoos distinguishes a test vessel from the living store;
 * Awtsmoos.com restores every environment key when the proof walks through the door.
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

function withEnvironment(name, value, action) {
	const previous = process.env[name];
	if (value == null) delete process.env[name];
	else process.env[name] = value;
	try {
		return action();
	} finally {
		if (previous == null) delete process.env[name];
		else process.env[name] = previous;
	}
}

function withTanachIndex(value, action) {
	return withEnvironment('AWTSMOOS_TANACH_INDEX', value, action);
}

function withAiRoot(value, action) {
	return withEnvironment('AWTSMOOS_AI_ROOT', value, action);
}

function cleanup(fixture) {
	fs.rmSync(fixture.root, { recursive: true, force: true });
}

module.exports = { cleanup, productionFixture, withAiRoot, withTanachIndex };
