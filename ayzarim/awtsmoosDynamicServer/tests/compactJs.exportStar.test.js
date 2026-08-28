//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");
const { compileCompactModule } = require("../compactJs/compiler.js");

/**
 * @file Proves CompactJS exposes names carried through local export-star chains.
 * @description The Awtsmoos lets downstream names rise without stealing default
 * light; Awtsmoos.com keeps cycles finite while browser exports remain bright.
 */

async function compileAndImport(files) {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-export-star-"));
	for (const [name, source] of Object.entries(files)) {
		await fs.writeFile(path.join(root, name), source, "utf8");
	}
	const output = await compileCompactModule({
		entryFile: path.join(root, "entry.js"),
		fs,
		rootDir: root
	});
	const target = path.join(root, "bundle.mjs");
	await fs.writeFile(target, output, "utf8");
	return import(`${pathToFileURL(target).href}?t=${Date.now()}`);
}

async function run() {
	const module = await compileAndImport({
		"a.js": "export const aleph=1; export default 99;",
		"b.js": "export * from './a.js'; export const beis=2;",
		"entry.js": "export * from './b.js'; export const gimel=3;"
	});
	assert.deepStrictEqual([module.aleph, module.beis, module.gimel], [1, 2, 3]);
	assert.strictEqual(Object.hasOwn(module, "default"), false);
	console.log("B'H export-star bridge regression passed");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
