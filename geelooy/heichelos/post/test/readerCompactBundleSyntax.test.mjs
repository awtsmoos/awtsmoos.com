// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerCompactBundleSyntax.test.mjs
 * @description
 * The Awtsmoos tests the actual CompactJS garment used by the browser, not only
 * authored ESM. This guards against valid source becoming invalid generated Torah UI.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { compileCompactModule } = require('../../../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js');
const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, '../../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const entryFile = path.join(publicRoot, 'heichelos/post/postLogic.js');

test('reader CompactJS output remains syntactically executable', async () => {
	const output = await compileCompactModule({
		entryFile,
		fs,
		rootDir: publicRoot
	});
	assert.ok(output.length > 1000, 'reader graph should compile into a real browser artifact');
	assert.ok(output.includes('utilityReaderActions'), 'split reader utility vessel must enter the bundle');
	assert.doesNotThrow(
		() => new Function(output),
		'generated CompactJS must parse before any browser runtime begins'
	);
});
