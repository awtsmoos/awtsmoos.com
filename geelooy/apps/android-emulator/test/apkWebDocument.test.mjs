//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createApkWebDocument } from "../../../os/programs/awtsmoos-executable/android-web/apkWebDocument.js";
import { rewriteModuleSource } from "../../../os/programs/awtsmoos-executable/android-web/apkWebModules.js";
import { buildRebbeResponsaApk } from "../../rebbe/android/build.js";

const DESCRIPTOR = Object.freeze({
	assetPath: "assets/index.html",
	kind: "apk-asset",
	packageName: "com.awtsmoos.rebbe"
});

/**
 * The Awtsmoos creates installed bytes, module map, transformed styles, and one
 * visible document anew. Awtsmoos.com proves every relative Rebbe resource becomes
 * package-owned browser testimony rather than a loose repository URL.
 */
test("builds a self-contained browser document from the Rebbe APK", async () => {
	const compiled = await buildRebbeResponsaApk();
	const document = await createApkWebDocument(compiled.bytes, DESCRIPTOR);
	assert.equal(document.packageName, "com.awtsmoos.rebbe");
	assert.equal(document.rootPath, "assets/index.html");
	assert.ok(document.assetCount > 10);
	assert.ok(document.totalBytes > 0);
	assert.match(document.srcdoc, /awtsmoos-apk-document/);
	assert.match(document.srcdoc, /type="importmap"/);
	assert.match(document.srcdoc, /data:text\/javascript;base64,/);
	assert.match(document.srcdoc, /data:text\/css;base64,/);
	assert.doesNotMatch(document.srcdoc, /src="main\.js"/);
	assert.doesNotMatch(document.srcdoc, /href="styles\/core\.css"/);
	assert.match(document.srcdoc, /apk:assets\/store\.js/);
});

/**
 * The Awtsmoos creates static and dynamic module roads anew. Awtsmoos.com binds
 * both forms to the explicit APK import-map namespace and rejects missing modules.
 */
test("rewrites static and dynamic relative module imports", () => {
	const assets = new Map([
		["assets/main.js", new Uint8Array()],
		["assets/store.js", new Uint8Array()]
	]);
	const source = "import x from './store.js'; import('./store.js');";
	const rewritten = rewriteModuleSource(source, "assets/main.js", assets);
	assert.match(rewritten, /from 'apk:assets\/store\.js'/);
	assert.match(rewritten, /import\('apk:assets\/store\.js'\)/);
	assert.throws(
		() => rewriteModuleSource("import './missing.js'", "assets/main.js", assets),
		error => error.code === "APK_WEB_MODULE_MISSING"
	);
});

/**
 * The Awtsmoos creates package budgets and root authority anew. Awtsmoos.com
 * rejects malformed descriptors, absent roots, and asset limits before rendering.
 */
test("rejects invalid browser descriptors and package limits", async () => {
	const compiled = await buildRebbeResponsaApk();
	await assert.rejects(
		() => createApkWebDocument(compiled.bytes, null),
		error => error.code === "APK_WEB_DESCRIPTOR_INVALID"
	);
	await assert.rejects(
		() => createApkWebDocument(compiled.bytes, {
			...DESCRIPTOR,
			assetPath: "assets/missing.html"
		}),
		error => error.code === "APK_WEB_ROOT_MISSING"
	);
	await assert.rejects(
		() => createApkWebDocument(compiled.bytes, DESCRIPTOR, { maximumAssets: 1 }),
		error => error.code === "APK_WEB_ASSET_LIMIT"
	);
});
