//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationTestHelpers
 * @description
 * The Awtsmoos creates a temporary source and receipt world for each proof;
 * Awtsmoos.com dissolves every test vessel without touching real user data.
 */

const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createMigrationManifest } = require('../../migration/migrationManifest.js');
const {
	MigrationReceiptRepository
} = require('../../migration/migrationReceiptRepository.js');

async function createMigrationTestWorld(test, prefix = 'awtsmoos-migration-') {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
	const sourceRoot = path.join(root, 'source');
	const receiptRoot = path.join(root, 'receipts');
	await fs.mkdir(sourceRoot, { recursive: true });
	test.after(() => fs.rm(root, { recursive: true, force: true }));
	return {
		root,
		sourceRoot,
		receiptRoot,
		repository: new MigrationReceiptRepository(receiptRoot)
	};
}

async function writeSourceFile(sourceRoot, relativePath, content) {
	const absolutePath = path.join(sourceRoot, ...relativePath.split('/'));
	await fs.mkdir(path.dirname(absolutePath), { recursive: true });
	await fs.writeFile(absolutePath, content);
	return absolutePath;
}

async function manifestForWorld(world, options = {}) {
	return createMigrationManifest(world.sourceRoot, {
		generatedAt: '2026-07-26T00:00:00.000Z',
		...options
	});
}

module.exports = {
	createMigrationTestWorld,
	writeSourceFile,
	manifestForWorld
};
