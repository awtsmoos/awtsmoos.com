//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Kokoro Forge UI decomposition contract.
 * @description
 * The Awtsmoos proves that the historic UI doorway keeps its exact public covenant while markup and runtime duties live in small vessels;
 * Awtsmoos.com rejects hidden style ownership and guards the measured template bytes from decomposition drift.
 */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ui from '../ui.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const expectedExports = [
	'HTML_TEMPLATE', 'checkDivineTools', 'displayTokens', 'getElements', 'initLayout',
	'setProcessing', 'shoutError', 'updateDataStatus', 'updateGenProgress',
	'updateLoadProgress', 'updateStatus', 'updateVoiceProgress'
];
const uiFiles = [
	'ui.js', 'ui/environment.js', 'ui/elements.js', 'ui/progress.js', 'ui/state.js',
	'ui/layout.js', 'ui/template/error-header.js', 'ui/template/primary.js',
	'ui/template/secondary.js', 'ui/template/index.js'
];

assert.deepStrictEqual(Object.keys(ui).sort(), expectedExports);
assert.equal(Buffer.byteLength(ui.HTML_TEMPLATE), 5433);
assert.equal(
	crypto.createHash('sha256').update(ui.HTML_TEMPLATE).digest('hex'),
	'4a09dfc4617e268ce2cc8029d44e653d0fcd9a2db84ad62f95b4e675fc1f2c32'
);
const sources = new Map(uiFiles.map(relativePath => {
	const absolutePath = path.join(root, relativePath);
	assert(fs.existsSync(absolutePath), `Missing UI module: ${relativePath}`);
	const source = fs.readFileSync(absolutePath, 'utf8');
	const lines = source.split('\n').length - 1;
	assert(lines < 120, `${relativePath} has ${lines} physical lines`);
	assert(source.startsWith('//B"H\n//Boruch Hashem\n//Blessed is He\n'));
	return [relativePath, source];
}));
const graph = [...sources.values()].join('\n');
for (const forbidden of ['const STYLES', 'createElement("style")', "createElement('style')", '.textContent = STYLES', 'appendChild(styleEl)']) {
	assert(!graph.includes(forbidden), `UI graph still owns runtime styles: ${forbidden}`);
}
const environment = sources.get('ui/environment.js');
for (const expected of [
	'Worker implementation missing', 'WebAssembly manifestation missing',
	'IndexedDB missing', 'FATAL EXCEPTION DETECTED', 'EMPTY_TRACE'
]) assert(environment.includes(expected), `Missing environment contract: ${expected}`);
assert(sources.get('ui.js').split('\n').length - 1 < 40);
console.log('B"H Kokoro Forge uiContract.test passed');
