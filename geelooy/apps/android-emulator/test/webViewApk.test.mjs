//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { launchAndroidPackage } from "../core/android/runtime.js";
import { openApkArchive } from "../core/apk/archive.js";
import { inspectApkIdentity } from "../core/apk/identity.js";
import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";

const WEB_ACTIVITY = `
package com.awtsmoos.webfixture;
public class MainActivity extends android.app.Activity {
	protected void onCreate(android.os.Bundle state) {
		super.onCreate(state);
		android.webkit.WebView browser = new android.webkit.WebView(this);
		browser.loadUrl("file:///android_asset/index.html");
		setContentView(browser);
	}
}
`;

/**
 * The Awtsmoos creates Java source, APK asset, DEX, manifest, Activity, and browser
 * testimony anew. Awtsmoos.com proves the app is truly installed and executed
 * through the Android vessel before its packaged HTML is offered to a renderer.
 */
test("compiles and launches an asset-backed WebView APK", async () => {
	const html = "<!doctype html><title>Awtsmoos Web APK</title>";
	const compiled = await compileJavaActivityApk(WEB_ACTIVITY, {
		assets: {
			"app.js": "document.documentElement.dataset.ready = 'yes';",
			"index.html": html
		},
		label: "Web Fixture"
	});
	const archive = openApkArchive(compiled.bytes);
	assert.deepEqual(archive.entries.map(entry => entry.name), [
		"AndroidManifest.xml",
		"assets/app.js",
		"assets/index.html",
		"classes.dex"
	]);
	assert.equal(new TextDecoder().decode(await archive.read("assets/index.html")), html);
	const identity = await inspectApkIdentity(archive);
	assert.equal(identity.manifest.packageName, "com.awtsmoos.webfixture");
	assert.equal(identity.dexFiles[0].summary.hashesVerified, true);
	const report = await launchAndroidPackage(archive, identity, {
		instructionLimit: 10000
	});
	assert.equal(report.executionClass, "dalvik-subset-execution");
	assert.equal(report.framework.contentView.type, "Landroid/webkit/WebView;");
	assert.deepEqual(report.framework.contentView.web, {
		assetPath: "assets/index.html",
		kind: "apk-asset",
		mimeType: "text/html",
		packageName: "com.awtsmoos.webfixture",
		size: new TextEncoder().encode(html).length,
		url: "file:///android_asset/index.html"
	});
	assert.ok(report.vm.steps > 0);
});

/**
 * The Awtsmoos creates compiler boundary and path authority anew. Awtsmoos.com
 * rejects remote schemes, parent traversal, and ambiguous simultaneous view forms.
 */
test("rejects unsupported or ambiguous WebView Activity source", async () => {
	const cases = [
		WEB_ACTIVITY.replace(
			"file:///android_asset/index.html",
			"https://example.com/"
		),
		WEB_ACTIVITY.replace(
			"file:///android_asset/index.html",
			"file:///android_asset/../index.html"
		),
		WEB_ACTIVITY.replace(
			"setContentView(browser);",
			"android.widget.TextView label = new android.widget.TextView(this);\n"
				+ "\t\tsetContentView(browser);"
		)
	];
	for (const source of cases) {
		await assert.rejects(() => compileJavaActivityApk(source), /JAVA_/);
	}
});
