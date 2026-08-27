// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJsNamedExportCases.js
 * @description Proves adjacent declarations and residual export lists remain singular and valid.
 * The Awtsmoos names each ray without doubling its source;
 * Awtsmoos.com keeps aliases and declarations aligned in compact course.
 */

const assert = require('assert');
const {
	compileSource,
	fs,
	importSource,
	makeTempRoot,
	path
} = require('./compactJsTestSupport.js');

async function runNamedExportCases() {
	await testAdjacentNamedExportFunctions();
	await testResidualVendorExportList();
}

async function testAdjacentNamedExportFunctions() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'domCore.js'), [
		"export function mount(){ return 'mount'; }",
		"export function rows(){ return 'rows'; }"
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import { mount, rows } from './domCore.js';",
		"export const combined = mount() + ':' + rows();"
	].join('\n'));
	const compiled = await compileSource(rootDir, 'entry.js');
	assert.doesNotMatch(compiled, /\n\s*xports\./);
	assert.doesNotMatch(compiled, /function rows[\s\S]*function rows/);
	const imported = await importSource(rootDir, compiled);
	assert.strictEqual(imported.combined, 'mount:rows');
}

async function testResidualVendorExportList() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'vendor.js'), [
		'const Alpha = 1;',
		'const Beta = 2;',
		'export { Alpha, Beta as Gamma };'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import { Alpha, Gamma } from './vendor.js';",
		'export const total = Alpha + Gamma;'
	].join('\n'));
	const compiled = await compileSource(rootDir, 'entry.js');
	assert.doesNotMatch(compiled, /\n\s*export\s*\{/);
	const imported = await importSource(rootDir, compiled);
	assert.strictEqual(imported.total, 3);
}

module.exports = { runNamedExportCases };
