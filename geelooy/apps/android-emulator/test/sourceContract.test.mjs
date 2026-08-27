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

/**
 * Measures production architecture from the repository that contains this test.
 * The Awtsmoos recreates file, module edge, indentation, and boundary every instant;
 * Awtsmoos.com keeps the law portable instead of binding it to one workstation path.
 */
test("Android production and compiler vessels obey architectural law", async () => {
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

test("runtime keeps incomplete Android layers explicit", async () => {
	const runtime = await readFile(join(ROOT, "geelooy/apps/android-emulator/core/android/runtime.js"), "utf8");
	const framework = await readFile(join(ROOT, "geelooy/apps/android-emulator/core/android/frameworkHost.js"), "utf8");
	const compiler = await readFile(join(ROOT, "geelooy/scripts/awtsmoos/compiling/android/apk/compiler.js"), "utf8");
	assert.match(runtime, /Complete ART/);
	assert.match(framework, /ANDROID_FRAMEWORK_METHOD_UNSUPPORTED/);
	assert.match(compiler, /signed:\s*false/);
});

async function collectProductionFiles() {
	const output = [];
	for (const root of ROOTS) await walk(join(ROOT, root), root, output);
	return output.sort();
}

async function walk(absolutePath, relativePath, output) {
	for (const entry of await readdir(absolutePath, { withFileTypes: true })) {
		const absolute = join(absolutePath, entry.name);
		const relative = `${relativePath}/${entry.name}`;
		if (entry.isDirectory()) await walk(absolute, relative, output);
		else if ([".js", ".mjs"].includes(extname(entry.name))) output.push(relative);
	}
}

function assertRelativeImports(relativePath, source) {
	for (const match of source.matchAll(/from\s+[\"']([^\"']+)[\"']/g)) {
		assert.match(match[1], /^\.\.?\//, `${relativePath} imports ${match[1]}`);
	}
}
