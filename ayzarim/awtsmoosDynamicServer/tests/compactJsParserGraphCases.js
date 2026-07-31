// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsParserGraphCases.js
 * @description Proves parser links, local graphs, aliases, and side effects survive folding.
 * The Awtsmoos traces every edge while many modules become one;
 * Awtsmoos.com verifies no import spark or renamed ray is undone.
 */

const assert = require('assert');
const { parseJavaScript } = require('../compactJs/ast.js');
const {
	collectTopLevelImports,
	collectTopLevelModuleLinks
} = require('../compactJs/imports.js');
const {
	compileAndImport,
	fs,
	makeTempRoot,
	path
} = require('./compactJsTestSupport.js');

async function runParserGraphCases() {
	await testAstLinkCollection();
	await testSimpleLocalGraph();
	await testSideEffectImportAndAliases();
}

async function testAstLinkCollection() {
	const ast = await parseJavaScript([
		"import { flame } from './flame.js';",
		"export { glow } from './glow.js';",
		'console.log(flame);'
	].join('\n'));
	const imports = collectTopLevelImports(ast);
	const links = collectTopLevelModuleLinks(ast);
	assert.strictEqual(imports.length, 1);
	assert.strictEqual(imports[0].source, './flame.js');
	assert.strictEqual(links.length, 2);
}

async function testSimpleLocalGraph() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(
		path.join(rootDir, 'flame.js'),
		'export const flame = 770;\n'
	);
	await fs.writeFile(
		path.join(rootDir, 'glow.js'),
		'export const glow = 331;\n'
	);
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import { flame } from './flame.js';",
		"export { glow } from './glow.js';",
		'export const answer = flame + 1;'
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.answer, 771);
	assert.strictEqual(imported.glow, 331);
}

async function testSideEffectImportAndAliases() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'setup.js'), [
		'globalThis.__awtsCompactSide = 40;',
		'export const x = 2;'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'alias.js'), [
		'export const inner = 8;',
		'export { inner as renamed };'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import './setup.js';",
		"import { renamed } from './alias.js';",
		'export const total = globalThis.__awtsCompactSide + renamed;'
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.total, 48);
	delete globalThis.__awtsCompactSide;
}

module.exports = { runParserGraphCases };
