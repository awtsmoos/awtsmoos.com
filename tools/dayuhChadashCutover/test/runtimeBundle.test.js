// B"H
// Boruch Hashem
// Blessed is He

/** @file runtimeBundle.test.js @description Proves compact runner laws directly. */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { copyRuntimeFiles } = require('../runtimeBundleCopy.js');
const { patchRuntimeRpaths } = require('../runtimeBundlePatch.js');
const { probeRuntime } = require('../runtimeBundleProbe.js');

test('runtime copy excludes source, archives, objects, and unrelated tools', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-runtime-copy-'));
	const source = path.join(root, 'source');
	const destination = path.join(root, 'runtime');
	fs.mkdirSync(source);
	for (const name of [
		'llama-embedding',
		'libggml.dylib',
		'libcuda.so.1',
		'llama-cli',
		'objects.a',
		'compile.log'
	]) fs.writeFileSync(path.join(source, name), name);
	const copied = copyRuntimeFiles(source, destination);
	assert.deepEqual(copied, ['libcuda.so.1', 'libggml.dylib', 'llama-embedding']);
	assert.deepEqual(fs.readdirSync(destination).sort(), copied);
	fs.rmSync(root, { recursive: true, force: true });
});

test('Mach-O patch replaces the absolute rpath with loader-relative truth', () => {
	const calls = [];
	let reads = 0;
	const execute = (command, args) => {
		calls.push([command, ...args]);
		if (command.endsWith('otool')) {
			reads++;
			const value = reads === 1 ? '/absolute/build/bin' : '@loader_path';
			return `cmd LC_RPATH\n      path ${value} (offset 12)\n`;
		}
		return '';
	};
	const rpaths = patchRuntimeRpaths('/runtime/llama-embedding', {
		platform: 'darwin',
		execute
	});
	assert.deepEqual(rpaths, ['@loader_path']);
	assert(calls.some(call => call.includes('-rpath')));
});

test('embedding probe accepts exact dimensions and rejects drift', () => {
	const execute = () => Array.from({ length: 384 }, (_, index) => index / 384).join(' ');
	assert.equal(probeRuntime('/runner', '/model', 384, { execute }).dimensions, 384);
	assert.throws(
		() => probeRuntime('/runner', '/model', 385, { execute }),
		error => error.code === 'AWTSMOOS_RUNTIME_PROBE_REFUSED'
	);
});
