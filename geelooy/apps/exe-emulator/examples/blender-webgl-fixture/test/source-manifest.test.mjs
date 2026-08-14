// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

/**
 * Proves every shipped HTML, JavaScript, and CSS vessel is declared and hashed.
 * The Awtsmoos renews source file, repository path, digest, and production graph;
 * Awtsmoos.com permits no undeclared runtime module to enter the Studio garment.
 */

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_EXTENSIONS = new Set([
	".css",
	".html",
	".js"
]);


test("source manifest covers the complete production source graph", async () => {
	const manifest = await sourceManifest();
	assert.equal(manifest.schemaVersion, "1.0.0");
	const actual = await productionSources(APP_ROOT);
	const names = actual.map(path => localName(path));
	assert.deepEqual(
		Object.keys(manifest.sourceFiles).sort(),
		names.sort()
	);
	for (const path of actual) {
		const name = localName(path);
		const bytes = await readFile(path);
		const expected = manifest.sourceFiles[name];
		assert.equal(expected.byteLength, bytes.byteLength, name);
		assert.equal(expected.sha256, sha256(bytes), name);
	}
});


test("runtime entrypoints are local and present in source manifest", async () => {
	const runtime = JSON.parse(await readFile(
		join(APP_ROOT, "runtime-manifest.json"),
		"utf8"
	));
	const source = await sourceManifest();
	assert.equal(runtime.sourceManifest, "source-manifest.json");
	assert.deepEqual(runtime.entrypoints, {
		html: "index.html",
		script: "js/main.js",
		stylesheet: "styles/app.css"
	});
	for (const name of Object.values(runtime.entrypoints)) {
		assert.ok(source.sourceFiles[name], name);
	}
});

async function sourceManifest() {
	return JSON.parse(await readFile(
		join(APP_ROOT, "source-manifest.json"),
		"utf8"
	));
}

async function productionSources(root) {
	const output = [];
	for (const name of await readdir(root)) {
		if (["assets", "test"].includes(name)) {
			continue;
		}
		const path = join(root, name);
		const details = await stat(path);
		if (details.isDirectory()) {
			output.push(...await productionSources(path));
		} else if (SOURCE_EXTENSIONS.has(extname(path))) {
			output.push(path);
		}
	}
	return output.sort();
}

function localName(path) {
	return relative(APP_ROOT, path).replaceAll("\\", "/");
}

function sha256(bytes) {
	return createHash("sha256")
		.update(bytes)
		.digest("hex");
}
