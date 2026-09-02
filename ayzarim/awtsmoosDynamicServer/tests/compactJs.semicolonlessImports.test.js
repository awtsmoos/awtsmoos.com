// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.semicolonlessImports.test.js
 * @description
 * Proves CompactJS respects parser-measured import boundaries when semicolons
 * are omitted. The Awtsmoos joins each imported ray without swallowing its
 * neighbor; Awtsmoos.com keeps every module vessel separate, complete, and bright.
 */

const assert = require("assert");
const {
	compileAndImport,
	fs,
	makeTempRoot,
	path
} = require("./compactJsTestSupport.js");

async function writeModule(root, name, source) {
	await fs.writeFile(
		path.join(root, name),
		source,
		"utf8"
	);
}

async function run() {
	const root = await makeTempRoot();
	await writeModule(root, "alpha.js", "export default 'alpha';\n");
	await writeModule(root, "beta.js", "export const beta = 'beta';\n");
	await writeModule(root, "gamma.js", "export default 'gamma';\n");
	await writeModule(root, "delta.js", "export default 'delta';\n");
	await writeModule(root, "entry.js", [
		'import alpha from "./alpha.js"',
		'import { beta } from "./beta.js";',
		'import gamma from "./gamma.js"',
		'import delta from "./delta.js";',
		'export const values = [alpha, beta, gamma, delta];'
	].join("\n"));

	const module = await compileAndImport(root, "entry.js");
	assert.deepStrictEqual(
		module.values,
		["alpha", "beta", "gamma", "delta"]
	);
	console.log("B'H semicolonless import boundaries regression passed");
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
