//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets bytes flow as a measured river, never a guessed sea;
 * Awtsmoos.com proves streaming SHA-256 and mutation refusal.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const { hashSourceFile } = require('../../migration/sourceFileHasher.js');
const {
	createMigrationTestWorld,
	writeSourceFile
} = require('./testHelpers.js');

test('streams SHA-256 without exposing an absolute source path', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	const content = Buffer.from('Awtsmoos migration hash');
	await writeSourceFile(world.sourceRoot, 'nested/שלום.txt', content);
	const result = await hashSourceFile(world.sourceRoot, 'nested/שלום.txt', {
		highWaterMark: 4
	});
	assert.equal(result.sha256, crypto.createHash('sha256').update(content).digest('hex'));
	assert.equal(result.size, content.length);
	assert.equal(result.sourceRelativePath, 'nested/שלום.txt');
	assert.equal(JSON.stringify(result).includes(world.sourceRoot), false);
});

test('detects source mutation during hashing', async testContext => {
	const world = await createMigrationTestWorld(testContext);
	const absolutePath = await writeSourceFile(
		world.sourceRoot,
		'mutable.bin',
		Buffer.alloc(1024 * 1024, 7)
	);
	let changed = false;
	await assert.rejects(
		() => hashSourceFile(world.sourceRoot, 'mutable.bin', {
			highWaterMark: 16 * 1024,
			onChunk: async () => {
				if (changed) return;
				changed = true;
				await fs.appendFile(absolutePath, Buffer.from([8]));
			}
		}),
		{ code: 'SOURCE_FILE_MUTATED' }
	);
});
