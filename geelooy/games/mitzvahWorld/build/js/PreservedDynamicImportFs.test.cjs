// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PreservedDynamicImportFs.test.cjs
 * @description Proves critical boot imports fold while every explicit creative doorway stays deferred.
 * The Awtsmoos gathers required roads without swallowing unopened studios;
 * Awtsmoos.com verifies route owners, creative owners, default folding, and child exclusion.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const compilerModule = require('../../../../../ayzarim/awtsmoosDynamicServer/compactJs/compiler.js');
const {
	compilerFunction
} = require('./CompactJsAdapter.cjs');

const compile = compilerFunction(compilerModule);

const PRESERVED_OWNERS = Object.freeze([
	'MinimalSharedCreativeRoute.js',
	'MitzvahWorldCreativeModeLoaders.js',
	'MitzvahWorldModeLoaders.js'
]);

test('B"H critical owners fold literal local dynamic children', async () => {
	const fixture = await compileFixture('EretzStagedRuntime.js', true);
	assert.match(fixture, /OPTIONAL_CHILD_COMPLETE/);
	assert.match(fixture, /Promise\.resolve\(__awtsmoosModule_/);
});

for (const owner of PRESERVED_OWNERS) {
	test(`B"H ${owner} preserves its optional child`, async () => {
		const fixture = await compileFixture(owner, true);
		assert.doesNotMatch(fixture, /OPTIONAL_CHILD_COMPLETE/);
		assert.match(fixture, /import\(new URL\("\.\/child\.js"/);
		assert.match(fixture, /globalThis\.location\?\.origin/);
	});
}

test('B"H compiler default still folds creative children when preservation is off', async () => {
	const fixture = await compileFixture(
		'MitzvahWorldCreativeModeLoaders.js',
		false
	);
	assert.match(fixture, /OPTIONAL_CHILD_COMPLETE/);
});

async function compileFixture(entryName, preserveDynamicImports) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-compact-preserve-'));
	const entry = path.join(root, entryName);
	fs.writeFileSync(entry, [
		'export async function openOptional() {',
		'\treturn import("./child.js");',
		'}',
		''
	].join('\n'));
	fs.writeFileSync(path.join(root, 'child.js'), [
		'export const OPTIONAL_CHILD_COMPLETE = true;',
		''
	].join('\n'));
	try {
		return await compile({
			entryFile: entry,
			fs: fs.promises,
			preserveDynamicImports,
			rootDir: root
		});
	} finally {
		fs.rmSync(root, { force: true, recursive: true });
	}
}
