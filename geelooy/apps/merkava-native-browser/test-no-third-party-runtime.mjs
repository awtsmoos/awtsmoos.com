//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(ROOT, "../../..");

/** Reads one production source file using a repository-relative path. */
function source(relativePath) {
	return fs.readFileSync(path.join(REPO, relativePath), "utf8");
}

/** Production runtime files must never import mature browser engines. */
test("native product builds exclude third-party browser engines", () => {
	const macBuild = source("geelooy/apps/merkava-native-browser/native/platform/macos/build-macos-arch.sh");
	const macMain = source("geelooy/apps/merkava-native-browser/native/platform/macos/merkava_macos_main.m");
	const linuxBuild = source("geelooy/apps/merkava-native-browser/native/platform/linux/build-linux.sh");
	for (const text of [macBuild, macMain, linuxBuild]) {
		assert.doesNotMatch(text, /WebKit|webkit|GTK|gtk|Chromium|CEF|Electron|Blink|Gecko/);
	}
});

/** Package metadata must remain dependency-free for the native product. */
test("native browser package declares no dependency graph", () => {
	const packagePath = path.join(ROOT, "package.json");
	const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
	assert.equal(packageJson.dependencies, undefined);
	assert.equal(packageJson.devDependencies, undefined);
	assert.equal(packageJson.peerDependencies, undefined);
	assert.equal(packageJson.optionalDependencies, undefined);
});

/** Reference-only compatibility code cannot be pulled into product build scripts. */
test("reference compatibility sources remain outside product builds", () => {
	const macBuild = source("geelooy/apps/merkava-native-browser/native/platform/macos/build-macos-arch.sh");
	const linuxBuild = source("geelooy/apps/merkava-native-browser/native/platform/linux/build-linux.sh");
	assert.doesNotMatch(macBuild, /merkava_macos_compat/);
	assert.doesNotMatch(linuxBuild, /merkava_linux_compat/);
});
