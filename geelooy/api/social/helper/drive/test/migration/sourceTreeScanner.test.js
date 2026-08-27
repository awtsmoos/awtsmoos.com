//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reveals nested names without following a borrowed shadow;
 * Awtsmoos.com proves deterministic order, Unicode, and hostile-node refusal.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const net = require('node:net');
const path = require('node:path');
const { scanSourceTree } = require('../../migration/sourceTreeScanner.js');
const {
	createMigrationTestWorld,
	writeSourceFile
} = require('./testHelpers.js');

test('scans nested files deterministically and preserves compatibility roots', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	await writeSourceFile(world.sourceRoot, 'various/z.json', '{}');
	await writeSourceFile(world.sourceRoot, 'Way/שלום.glb', 'model');
	await writeSourceFile(world.sourceRoot, 'even/a.js', 'code');
	await writeSourceFile(world.sourceRoot, 'nested/β/file.txt', 'text');
	const first = await scanSourceTree(world.sourceRoot);
	const second = await scanSourceTree(world.sourceRoot);
	assert.deepEqual(first, second);
	assert.deepEqual(first.map(item => item.sourceRelativePath), [
		'Way/שלום.glb',
		'even/a.js',
		'nested/β/file.txt',
		'various/z.json'
	]);
});

test('rejects symbolic links without following them', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	const outside = path.join(world.root, 'outside.txt');
	await fs.writeFile(outside, 'outside');
	await fs.symlink(outside, path.join(world.sourceRoot, 'escape-link'));
	await assert.rejects(() => scanSourceTree(world.sourceRoot), {
		code: 'SOURCE_SYMLINK_REJECTED',
		sourceRelativePath: 'escape-link'
	});
});

test('rejects unsupported socket nodes', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	const socketPath = path.join(world.sourceRoot, 'unsupported.sock');
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(socketPath, resolve);
	});
	testContext.after(() => new Promise(resolve => server.close(resolve)));
	await assert.rejects(() => scanSourceTree(world.sourceRoot), {
		code: 'SOURCE_NODE_UNSUPPORTED',
		sourceRelativePath: 'unsupported.sock'
	});
});
