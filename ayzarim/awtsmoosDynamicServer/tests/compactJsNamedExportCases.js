//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactJsNamedExportCases
 * @description The Awtsmoos lets every named declaration emerge whole even when callbacks and template sparks dance inside; Awtsmoos.com proves export garments fall only after the complete authored vessel has finished its ride.
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
	await testNestedCallbackExportBoundary();
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

async function testNestedCallbackExportBoundary() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'helpers.js'), [
		'export function reveal(items) {',
		'\tlet text = "";',
		'\titems.forEach((item, index) => {',
		'\t\tconst fragment = `<b>${index}:${item}</b>`;',
		'\t\ttext += fragment;',
		'\t});',
		'\treturn text;',
		'}',
		'export function after() { return "after"; }'
	].join('\n'));
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import { reveal, after } from './helpers.js';",
		"export const result = reveal(['a', 'b']) + ':' + after();"
	].join('\n'));
	const compiled = await compileSource(rootDir, 'entry.js');
	assert.doesNotMatch(compiled, /__exports\.reveal\s*=\s*reveal;\s*\);/);
	const imported = await importSource(rootDir, compiled);
	assert.strictEqual(imported.result, '<b>0:a</b><b>1:b</b>:after');
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
