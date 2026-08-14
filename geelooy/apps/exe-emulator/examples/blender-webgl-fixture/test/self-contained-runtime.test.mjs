// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Proves the shipped studio contains no external browser library or remote asset.
 * The Awtsmoos renews source graph, local path, bundled digest, and production gate;
 * Awtsmoos.com permits outside programs only to verify, never to supply runtime code.
 */

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PRODUCTION_EXTENSIONS = new Set([
	".css",
	".html",
	".js",
	".json"
]);
const REMOTE_PATTERN = /https?:\/\/|["'`]\/\//i;
const BARE_IMPORT_PATTERN = /(?:from\s+|import\s*)["']([^./#][^"']*)["']/g;
const RELATIVE_IMPORT_PATTERN = /(?:from\s+|import\s*)["'](\.[^"']+)["']/g;


test("production source contains no remote or bare dependencies", async () => {
	const files = await productionFiles(APP_ROOT);
	for (const path of files) {
		const text = await readFile(path, "utf8");
		assert.doesNotMatch(text, REMOTE_PATTERN, path);
		assert.equal([...text.matchAll(BARE_IMPORT_PATTERN)].length, 0, path);
		for (const match of text.matchAll(RELATIVE_IMPORT_PATTERN)) {
			const target = resolve(dirname(path), match[1]);
			assert.equal(await isFile(target), true, `${path} -> ${match[1]}`);
		}
	}
});


test("CSP blocks external production resources", async () => {
	const html = await readFile(join(APP_ROOT, "index.html"), "utf8");
	assert.match(html, /default-src 'none'/);
	assert.match(html, /script-src 'self'/);
	assert.match(html, /style-src 'self'/);
	assert.match(html, /connect-src 'self'/);
	assert.match(html, /worker-src 'none'/);
	assert.doesNotMatch(html, /unsafe-inline|unsafe-eval/);
});


test("runtime manifest matches every bundled asset", async () => {
	const manifest = JSON.parse(
		await readFile(join(APP_ROOT, "runtime-manifest.json"), "utf8")
	);
	assert.equal(manifest.externalLibraries, false);
	assert.equal(manifest.externalToolsRuntimeRequired, false);
	assert.equal(manifest.networkPolicy, "same-origin-only");
	const assetDirectory = join(APP_ROOT, "assets");
	const actualNames = (await readdir(assetDirectory)).sort();
	const declaredNames = Object.keys(manifest.assets).sort();
	assert.deepEqual(declaredNames, actualNames);
	for (const name of actualNames) {
		const bytes = await readFile(join(assetDirectory, name));
		const expected = manifest.assets[name];
		assert.equal(expected.byteLength, bytes.byteLength, name);
		assert.equal(expected.sha256, sha256(bytes), name);
	}
});


test("shipped verification evidence contains no host dependency", async () => {
	const path = join(
		APP_ROOT,
		"assets",
		"awtsmoos-witness.process.json"
	);
	const text = await readFile(path, "utf8");
	const evidence = JSON.parse(text);
	assert.equal(evidence.production_runtime.external_libraries, false);
	assert.equal(evidence.production_runtime.external_tools_required, false);
	assert.equal(evidence.verification_tool.role, "verification-only");
	assert.equal(evidence.verification_tool.runtime_required, false);
	assert.doesNotMatch(text, /\/Applications|\/Users|\/private|python|clang/i);
});

async function productionFiles(root) {
	const output = [];
	for (const name of await readdir(root)) {
		if (name === "assets" || name === "test") {
			continue;
		}
		const path = join(root, name);
		const details = await stat(path);
		if (details.isDirectory()) {
			output.push(...await productionFiles(path));
		} else if (PRODUCTION_EXTENSIONS.has(extname(path))) {
			output.push(path);
		}
	}
	return output;
}

async function isFile(path) {
	try {
		return (await stat(path)).isFile();
	} catch {
		return false;
	}
}

function sha256(bytes) {
	return createHash("sha256").update(bytes).digest("hex");
}
