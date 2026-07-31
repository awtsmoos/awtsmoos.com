// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsExpressionExportCases.js
 * @description Proves template, logical, and adjacent-statement default exports remain whole.
 * The Awtsmoos holds nested words and branching values in one unbroken flame;
 * Awtsmoos.com verifies default vessels survive compaction without losing name.
 */

const assert = require('assert');
const {
	compileAndImport,
	compileSource,
	fs,
	importSource,
	makeTempRoot,
	path
} = require('./compactJsTestSupport.js');

async function runExpressionExportCases() {
	await testTemplateLiteralDefaultExport();
	await testLogicalExpressionDefaultExport();
	await testInlineDefaultExportAfterStatement();
}

async function testTemplateLiteralDefaultExport() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'style.js'), [
		'export default /*css*/`',
		'  .instructions { color: red; }',
		"  .slot::after { content: '\\`escaped\\`'; }",
		"  .value::before { content: '${(() => `nested`)()}'; }",
		'`;'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import skin from './style.js';",
		"export const hasInstructions = skin.includes('.instructions');"
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.hasInstructions, true);
}

async function testLogicalExpressionDefaultExport() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'runtime.js'), [
		'const scope = globalThis;',
		'scope.__compactRuntime ||= { ok:true };',
		'export default scope.__compactRuntime || null;'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import runtime from './runtime.js';",
		'export const ok = runtime.ok === true;'
	].join('\n'));
	const compiled = await compileSource(rootDir, 'entry.js');
	assert.doesNotMatch(compiled, /=\s*\|\|/);
	const imported = await importSource(rootDir, compiled);
	assert.strictEqual(imported.ok, true);
	delete globalThis.__compactRuntime;
}

async function testInlineDefaultExportAfterStatement() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'runtime.js'), [
		'function boot(){ return { ready:true }; }',
		'globalThis.__compactInline = boot();export default boot;'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import boot from './runtime.js';",
		'export const ready = boot().ready === true',
		'	&& globalThis.__compactInline.ready === true;'
	].join('\n'));
	const compiled = await compileSource(rootDir, 'entry.js');
	assert.doesNotMatch(compiled, /;\s*export\s+default\s+boot/);
	const imported = await importSource(rootDir, compiled);
	assert.strictEqual(imported.ready, true);
	delete globalThis.__compactInline;
}

module.exports = { runExpressionExportCases };
