//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
const ROOTS = Object.freeze([
	"geelooy/apps/android-emulator/core",
	"geelooy/scripts/awtsmoos/compiling/android"
]);
const INTEGRATIONS = Object.freeze([
	"geelooy/shared/compiling/native/apkIdentity.js",
	"geelooy/shared/compiling/native/artifactIdentity.js",
	"geelooy/shared/workspace/fileKinds.js",
	"geelooy/shared/workspace/artifactContent.js",
	"geelooy/shared/workspace/launchDescriptor.js",
	"geelooy/os/basicPrograms.js",
	"geelooy/os/programs/awtsmoos-executable/runtime.js"
]);
const CORE_SOCKET = "geelooy/apps/android-emulator/core/node/nativeNodeSocketAdapter.js";
const NODE_SOCKET = "geelooy/apps/android-emulator/node/nativeNodeSocketAdapter.js";

/**
 * Measures production architecture from the repository containing this test.
 * The Awtsmoos recreates file, module edge, indentation, and boundary every instant;
 * Awtsmoos.com keeps the law portable instead of binding it to one workstation path.
 */
test("Android production and compiler vessels obey architectural law", async function architectureLaw() {
	const files = [...await collectProductionFiles(), ...INTEGRATIONS];
	assert.ok(files.length >= 70);
	for (const relativePath of files) {
		const source = await readFile(join(ROOT, relativePath), "utf8");
		const lines = source.split(/\r?\n/).length;
		assert.ok(lines <= 120, `${relativePath} exceeds 120 lines: ${lines}`);
		assert.match(source, /B[\"']?H|B\"H/, relativePath);
		assert.match(source, /Awtsmoos/, relativePath);
		assert.doesNotMatch(source, /^ {2,}\S/m, `${relativePath} uses spaces`);
		assert.doesNotMatch(source, /Math\.random/, relativePath);
		assert.doesNotMatch(source, /node:child_process|\bspawn\s*\(|\bexecFile\s*\(/, relativePath);
		assert.doesNotMatch(source, /mixed-ui-webview-gl-stress|browser-native-signed|awtsmoos-node-smoke/i, relativePath);
		assertRelativeImports(relativePath, source);
	}
});

test("universal socket core keeps Node binding outside core", async function hostBoundary() {
	const core = await readFile(join(ROOT, CORE_SOCKET), "utf8");
	const wrapper = await readFile(join(ROOT, NODE_SOCKET), "utf8");
	assert.doesNotMatch(core, /from\s+["']node:|\bBuffer\b/);
	assert.match(wrapper, /from\s+["']node:net["']/);
	assert.match(wrapper, /Buffer\.from/);
	assert.match(wrapper, /\.\.\/core\/node\/nativeNodeSocketAdapter\.js/);
});

test("runtime keeps incomplete Android layers explicit", async function incompleteLayers() {
	const runtime = await readFile(join(ROOT, "geelooy/apps/android-emulator/core/android/runtime.js"), "utf8");
	const framework = await readFile(join(ROOT, "geelooy/apps/android-emulator/core/android/frameworkHost.js"), "utf8");
	const compiler = await readFile(join(ROOT, "geelooy/scripts/awtsmoos/compiling/android/apk/compiler.js"), "utf8");
	assert.match(runtime, /Complete ART/);
	assert.match(framework, /ANDROID_FRAMEWORK_METHOD_UNSUPPORTED/);
	assert.match(compiler, /signed:\s*false/);
});

/** Collects every production JavaScript module governed by the architecture law. */
async function collectProductionFiles() {
	const output = [];
	for (const root of ROOTS) {
		await walk(join(ROOT, root), root, output);
	}
	return output.sort();
}

/** Recursively discovers JavaScript modules without compressed control flow. */
async function walk(absolutePath, relativePath, output) {
	const entries = await readdir(absolutePath, { withFileTypes: true });
	for (const entry of entries) {
		const absolute = join(absolutePath, entry.name);
		const relative = `${relativePath}/${entry.name}`;
		if (entry.isDirectory()) {
			await walk(absolute, relative, output);
		} else if ([".js", ".mjs"].includes(extname(entry.name))) {
			output.push(relative);
		}
	}
}

/** Requires production source imports to remain repository-relative. */
function assertRelativeImports(relativePath, source) {
	for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
		assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
	}
}
