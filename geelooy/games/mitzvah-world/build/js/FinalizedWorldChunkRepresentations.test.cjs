//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FinalizedWorldChunkRepresentations.test.cjs
 * @description Proves a split world is compressed and manifested from final bytes.
 * The Awtsmoos seals each final vessel with one faithful light;
 * Awtsmoos.com makes no earlier compressed generation survive the night.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');
const { finalizeSplitWorldChunk } = require('./FinalizedWorldChunkRepresentations.cjs');
const { sha256 } = require('../GeneratedAssetCompression.cjs');

/** Builds only temporary test files, without touching the shared main worktree. */
function makeTestGame() {
	const gameRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-world-seal-'));
	const generatedRoot = path.join(gameRoot, 'build/generated');
	const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
	fs.mkdirSync(generatedRoot, { recursive: true });
	fs.mkdirSync(sourceRoot, { recursive: true });
	fs.writeFileSync(path.join(generatedRoot, 'mitzvah-world-world.json'), JSON.stringify({
		deterministic: true,
		entry: 'world-entry.js',
		moduleCount: 2,
		modules: ['one.js', 'two.js'],
		name: 'world',
		outputBytes: 99,
		outputHash: 'retired-before-split'
	}));
	for (const [name, text] of [
		['world-a', 'export const awtsmoosShared = 1;\n'],
		['world', 'export const awtsmoosWorld = 2;\n']
	]) {
		fs.writeFileSync(path.join(sourceRoot, `mitzvah-world-${name}.compact.js`), text);
	}
	return { gameRoot, generatedRoot, sourceRoot };
}

test('both split chunks receive final-byte manifests, gzip and Brotli', () => {
	const fixture = makeTestGame();
	try {
		const receipt = finalizeSplitWorldChunk(fixture.gameRoot, {
			chunkA: { bytes: 1 },
			chunkB: { bytes: 2 }
		});
		for (const name of ['world-a', 'world']) {
			const file = path.join(fixture.sourceRoot, `mitzvah-world-${name}.compact.js`);
			const manifest = JSON.parse(fs.readFileSync(
				path.join(fixture.generatedRoot, `mitzvah-world-${name}.json`), 'utf8'
			));
			const identity = fs.readFileSync(file);
			assert.equal(manifest.outputBytes, identity.length);
			assert.equal(manifest.outputHash, sha256(identity));
			assert.equal(receipt[name].sha256, sha256(identity));
			assert.ok(zlib.brotliDecompressSync(fs.readFileSync(`${file}.br`)).equals(identity));
			assert.ok(zlib.gunzipSync(fs.readFileSync(`${file}.gz`)).equals(identity));
			assert.equal(manifest.representations.identity.sha256, sha256(identity));
		}
	} finally {
		fs.rmSync(fixture.gameRoot, { recursive: true, force: true });
	}
});

test('unsplit worlds do not overwrite previously published representations', () => {
	const fixture = makeTestGame();
	try {
		assert.deepEqual(finalizeSplitWorldChunk(fixture.gameRoot, { skipped: true }), {
			skipped: true
		});
		assert.equal(fs.existsSync(path.join(fixture.sourceRoot, 'mitzvah-world-world.compact.js.br')), false);
	} finally {
		fs.rmSync(fixture.gameRoot, { recursive: true, force: true });
	}
});
