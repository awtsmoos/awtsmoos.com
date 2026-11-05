//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldChunkSplit.test.js
 * @description Proves the world-chunk split keeps every module reachable and is
 * deterministic: a synthetic over-cap bundle (with gapped module numbering like
 * the real compiler output) splits into two sub-cap parseable chunks whose
 * shared registry preserves every module by number, and re-running the script
 * is byte-identical. It also witnesses the live production artifacts.
 * The Awtsmoos gathers code into measured vessels; this test proves no vessel
 * is lost when the bundle is divided for the deploy limit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_BUILD_SCRIPT = '/home/hatch/workspace/mw-repo/geelooy/games/mitzvahWorld/build/split-world-chunk.cjs';
const LIVE_SRC = '/home/hatch/workspace/mw-repo/geelooy/games/mitzvahWorld/experiments/Awtsmoos/src';
const DEPLOY_LIMIT = 5242880;
const SPLIT_CAP = 4800000;

// Module numbers with gaps, like the real compiler output (0,1,2,3,5,6,9,...).
const MODULE_NUMBERS = [];
for (let n = 0; n < 200; n += 1) {
	if (n === 4 || n === 7 || n === 8 || (n > 90 && n < 100)) continue;
	MODULE_NUMBERS.push(n);
}
const WITNESS_MODULE = MODULE_NUMBERS[MODULE_NUMBERS.length - 1]; // last block: always lands in chunk B

function fixtureBundle() {
	const pad = '// padding to exceed the split cap. '.repeat(900);
	// The real compiler declares every module vessel in the header, then each
	// block populates its own vessel inside a bare block scope.
	let bundle = '//B"H\n';
	for (const n of MODULE_NUMBERS) {
		bundle += `const __awtsmoosModule_${n} = Object.create(null);\n`;
	}
	for (const n of MODULE_NUMBERS) {
		bundle += `// ---- module block ${n} ----\n`;
		bundle += `{\n`;
		bundle += `const __exports = __awtsmoosModule_${n};\n`;
		bundle += `__exports.id = ${n};\n`;
		bundle += `__exports.value = ${n * 3};\n`;
		if (n === WITNESS_MODULE) {
			// The final chunk-B block reaches back into the first chunk-A
			// module through the shared registry.
			bundle += `const witness = __awtsmoosModule_0.value + 1;\n`;
			bundle += `__exports.computed = witness * 2;\n`;
		}
		bundle += `}\n`;
		bundle += pad + '\n';
	}
	bundle += `\nexport const installTestWorld = () => __awtsmoosModule_${WITNESS_MODULE}.computed;\n`;
	return bundle;
}

function fixtureLayout() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'world-split-'));
	const buildDir = path.join(root, 'build');
	const srcDir = path.join(root, 'experiments', 'Awtsmoos', 'src');
	fs.mkdirSync(buildDir, { recursive: true });
	fs.mkdirSync(srcDir, { recursive: true });
	fs.copyFileSync(REPO_BUILD_SCRIPT, path.join(buildDir, 'split-world-chunk.cjs'));
	fs.writeFileSync(path.join(srcDir, 'mitzvah-world-world.compact.js'), fixtureBundle());
	return { root, buildDir, srcDir };
}

function runSplit(buildDir) {
	const output = execFileSync(process.execPath, [path.join(buildDir, 'split-world-chunk.cjs')], { encoding: 'utf8' });
	return JSON.parse(output);
}

test('split script divides an over-cap bundle into two sub-cap parseable chunks', () => {
	const { buildDir, srcDir } = fixtureLayout();
	const receipt = runSplit(buildDir);
	assert.ok(receipt.blocks > 100, `expected many blocks, got ${receipt.blocks}`);
	assert.ok(receipt.splitAt > 0 && receipt.splitAt < receipt.blocks);
	assert.equal(receipt.modules, MODULE_NUMBERS.length);
	assert.ok(receipt.chunkA.bytes <= SPLIT_CAP, `chunk A over cap: ${receipt.chunkA.bytes}`);
	assert.ok(receipt.chunkB.bytes <= SPLIT_CAP, `chunk B over cap: ${receipt.chunkB.bytes}`);
	const chunkA = path.join(srcDir, 'mitzvah-world-world-a.compact.js');
	const chunkB = path.join(srcDir, 'mitzvah-world-world.compact.js');
	for (const file of [chunkA, chunkB]) {
		execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
	}
});

test('split chunks keep every module reachable across the chunk boundary', async () => {
	const { buildDir, srcDir } = fixtureLayout();
	runSplit(buildDir);
	const chunkA = await import(pathToFileURL(path.join(srcDir, 'mitzvah-world-world-a.compact.js')).href);
	const chunkB = await import(pathToFileURL(path.join(srcDir, 'mitzvah-world-world.compact.js')).href);
	const registry = chunkA.__awtsmoosSharedModules;
	assert.equal(Object.keys(registry).length, MODULE_NUMBERS.length, 'registry carries every module');
	for (const n of MODULE_NUMBERS) {
		assert.equal(registry[n].id, n, `registry lookup for module ${n} is wrong`);
	}
	// The chunk-B witness block read module 0 (chunk A) through the registry
	// and the footer export surfaces the cross-chunk computation.
	assert.equal(chunkB.installTestWorld(), (0 * 3 + 1) * 2);
});

test('split script is deterministic and idempotent', () => {
	const first = fixtureLayout();
	const second = fixtureLayout();
	runSplit(first.buildDir);
	runSplit(second.buildDir);
	const a1 = fs.readFileSync(path.join(first.srcDir, 'mitzvah-world-world-a.compact.js'));
	const a2 = fs.readFileSync(path.join(second.srcDir, 'mitzvah-world-world-a.compact.js'));
	const b1 = fs.readFileSync(path.join(first.srcDir, 'mitzvah-world-world.compact.js'));
	const b2 = fs.readFileSync(path.join(second.srcDir, 'mitzvah-world-world.compact.js'));
	assert.ok(a1.equals(a2), 'chunk A bytes are deterministic');
	assert.ok(b1.equals(b2), 'chunk B bytes are deterministic');
	const rerun = runSplit(first.buildDir);
	assert.equal(rerun.skipped, 'already-split', 'a split entry is never re-split');
	assert.ok(fs.readFileSync(path.join(first.srcDir, 'mitzvah-world-world-a.compact.js')).equals(a1));
});

test('live world chunk artifacts stay under the deploy limit and stay reachable', async () => {
	const chunkAPath = path.join(LIVE_SRC, 'mitzvah-world-world-a.compact.js');
	const chunkBPath = path.join(LIVE_SRC, 'mitzvah-world-world.compact.js');
	for (const file of [chunkAPath, chunkBPath]) {
		assert.ok(fs.existsSync(file), `missing artifact ${file}`);
		const bytes = fs.statSync(file).size;
		assert.ok(bytes <= DEPLOY_LIMIT, `${path.basename(file)} is ${bytes} bytes, over the ${DEPLOY_LIMIT} deploy limit`);
		assert.ok(bytes > 1000000, `${path.basename(file)} is suspiciously small: ${bytes}`);
	}
	const chunkA = await import(pathToFileURL(chunkAPath).href);
	const chunkB = await import(pathToFileURL(chunkBPath).href);
	const registry = chunkA.__awtsmoosSharedModules;
	// The registry may be the number-keyed object (current script) or the legacy
	// positional array (already-split artifacts); both must carry every module.
	const modules = Array.isArray(registry) ? registry : Object.values(registry);
	assert.ok(modules.length > 2000, `expected thousands of modules, got ${modules.length}`);
	const nonObjects = modules.filter(module => !(module && typeof module === 'object')).length;
	assert.equal(nonObjects, 0, 'every registry entry must be a live module object');
	assert.equal(typeof chunkB.installMinimalMeadowWorldSystems, 'function', 'the public entry export survives the split');
	// Every alias the chunk-B preamble creates must point at the module with the same number.
	const source = fs.readFileSync(chunkBPath, 'utf8');
	const aliases = [...source.matchAll(/const __awtsmoosModule_(\d+) = __awtsmoosSharedModules\[(\d+)\];/g)];
	assert.ok(aliases.length > 1000, 'chunk B should alias over a thousand shared modules');
	for (const [, name, index] of aliases) {
		assert.equal(name, index, `alias __awtsmoosModule_${name} indexes [${index}]`);
	}
});
