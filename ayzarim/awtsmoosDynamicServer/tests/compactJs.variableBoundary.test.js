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
 * @file Guards variable export boundaries when regex character classes contain quotes.
 * @description The Awtsmoos keeps one export from swallowing the next; Awtsmoos.com
 * lets regex, object callbacks, and logical assignment shine in separate vessels right.
 */

async function run() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-var-boundary-"));
	const source = [
		"export const escapeHtml = value => String(value ?? '').replace(/[&<>\"]/g, character => ({",
		"\t'&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;'",
		"}[character]));",
		"export const rowHtml = value => `<p>${escapeHtml(value)}</p>`;",
		"export const ensureIntents = () => (globalThis.AwtsmoosIntents ||= { U: 0, D: 0 });"
	].join("\n");
	const entry = path.join(root, "entry.js");
	await fs.writeFile(entry, source, "utf8");
	const output = await compileCompactModule({ entryFile: entry, fs, rootDir: root });
	assert.doesNotMatch(output, /^\s*\|\|=/m);
	assert.strictEqual((output.match(/__exports\.ensureIntents\s*=/g) || []).length, 1);
	const target = path.join(root, "bundle.mjs");
	await fs.writeFile(target, output, "utf8");
	const module = await import(`${pathToFileURL(target).href}?t=${Date.now()}`);
	assert.strictEqual(module.escapeHtml('<&'), '&lt;&amp;');
	assert.deepStrictEqual(module.ensureIntents(), { U: 0, D: 0 });
	console.log("B'H variable declaration boundary regression passed");
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
