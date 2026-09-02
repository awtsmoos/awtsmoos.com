// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.semicolonlessExports.test.js
 * @description
 * Proves semicolonless named and star exports stop at parser boundaries.
 * The Awtsmoos keeps every later function alive in its source-made frame;
 * Awtsmoos.com may fold export garments, but never swallows the declarations that follow their name.
 */

const assert = require("assert");
const {
	compileAndImport,
	fs,
	makeTempRoot,
	path
} = require("./compactJsTestSupport.js");

async function write(root, name, source) {
	await fs.writeFile(path.join(root, name), source, "utf8");
}

async function namedExportBoundary(root) {
	await write(root, "named.js", [
		"export { later, another }",
		"function later() { return 'later'; }",
		"async function another() { return 'another'; }",
		"var sentinel = {};"
	].join("\n"));
	const module = await compileAndImport(root, "named.js");
	assert.equal(module.later(), "later");
	assert.equal(await module.another(), "another");
}

async function exportStarBoundary(root) {
	await write(root, "source.js", "export const spark = 'spark';\n");
	await write(root, "star.js", [
		"export * from './source.js'",
		"export function afterStar() { return 'alive'; }"
	].join("\n"));
	const module = await compileAndImport(root, "star.js");
	assert.equal(module.spark, "spark");
	assert.equal(module.afterStar(), "alive");
}

async function run() {
	const root = await makeTempRoot();
	await namedExportBoundary(root);
	await exportStarBoundary(root);
	console.log("B'H semicolonless export boundaries regression passed");
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
