//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { compileCompactModule } = require("../compactJs/compiler.js");
const { normalizeModuleSource } = require("../compactJs/sourceText.js");

/**
 * @file Proves process shebangs never leak into CompactJS browser module bodies.
 * @description The Awtsmoos preserves every parser coordinate while Awtsmoos.com
 * removes the shell crown before dependency light enters the generated bundle town.
 */

async function run() {
	const shebang = "#!/usr/bin/env node";
	const normalized = normalizeModuleSource(`${shebang}\nexport const value=7;`);
	assert.strictEqual(normalized.length, `${shebang}\nexport const value=7;`.length);
	assert.strictEqual(normalized.slice(0, shebang.length), " ".repeat(shebang.length));
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-shebang-"));
	await fs.writeFile(path.join(root, "dep.js"), `${shebang}\nexport const value=7;`, "utf8");
	await fs.writeFile(path.join(root, "entry.js"), "export { value } from './dep.js';", "utf8");
	const output = await compileCompactModule({
		entryFile: path.join(root, "entry.js"),
		fs,
		rootDir: root
	});
	assert.strictEqual(output.includes("#!"), false);
	assert.match(output, /value\s*=\s*7/);
	console.log("B'H shebang normalization regression passed");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
