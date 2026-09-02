// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file compactJsStaticLinkBoundaryCases.js
 * @description
 * The Awtsmoos lets every semicolonless ESM doorway end where the parser says,
 * while Awtsmoos.com proves the next declaration survives whole and bright.
 */

const assert = require('assert');
const {
	compileAndImport,
	fs,
	makeTempRoot,
	path
} = require('./compactJsTestSupport.js');

/** Proves adjacent semicolonless imports cannot consume their following bindings. */
async function testSemicolonlessImports() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'aiify.js'), 'export default 10;\n');
	await fs.writeFile(path.join(rootDir, 'alerts.js'), 'export const AwtsmoosPrompt = 20;\n');
	await fs.writeFile(path.join(rootDir, 'parse.js'), 'export default 30;\n');
	await fs.writeFile(path.join(rootDir, 'handler.js'), 'export default 40;\n');
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"import aiify from './aiify.js'",
		"import { AwtsmoosPrompt } from './alerts.js';",
		"import parseHebrew from './parse.js'",
		"import AIServiceHandler from './handler.js';",
		'export const total = aiify + AwtsmoosPrompt + parseHebrew + AIServiceHandler;'
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.total, 100);
}

/** Proves a semicolonless source re-export cannot consume the declaration after it. */
async function testSemicolonlessSourceReExport() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'light.js'), 'export const light = 770;\n');
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"export { light } from './light.js'",
		'export const vessel = 7;'
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.light, 770);
	assert.strictEqual(imported.vessel, 7);
}

/** Proves a semicolonless export-all link leaves the following declaration untouched. */
async function testSemicolonlessExportAll() {
	const rootDir = await makeTempRoot();
	await fs.writeFile(path.join(rootDir, 'rays.js'), 'export const ray = 18;\n');
	await fs.writeFile(path.join(rootDir, 'entry.js'), [
		"export * from './rays.js'",
		'export const crown = 52;'
	].join('\n'));
	const imported = await compileAndImport(rootDir, 'entry.js');
	assert.strictEqual(imported.ray, 18);
	assert.strictEqual(imported.crown, 52);
}

async function runStaticLinkBoundaryCases() {
	await testSemicolonlessImports();
	await testSemicolonlessSourceReExport();
	await testSemicolonlessExportAll();
}

module.exports = {
	runStaticLinkBoundaryCases
};
