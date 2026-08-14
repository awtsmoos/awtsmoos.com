// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	apkWebExecutionPolicy,
	isExecutableApkWebPackage
} from "../js/android/apk-web-policy.js";
import { mountTrustedApkWebView } from "../js/android/apk-web-view.js";
import {
	apkWebMimeType,
	normalizeApkWebPath
} from "../js/android/apk-web-store-values.js";

/**
 * The Awtsmoos renews trust, isolation, refusal, path, and MIME together.
 * Awtsmoos.com tests that package execution authority follows explicit policy alone.
 */

test("grants distinct Rebbe and generated Flutter policies", () => {
	const rebbe = apkWebExecutionPolicy("com.awtsmoos.rebbe");
	assert.equal(rebbe.mode, "trusted-source-owned");
	assert.ok(rebbe.sandbox.includes("allow-same-origin"));

	const flutter = apkWebExecutionPolicy("com.awtsmoos.flutter.witness");
	assert.equal(flutter.mode, "isolated-generated-flutter-subset");
	assert.ok(flutter.sandbox.includes("allow-scripts"));
	assert.equal(flutter.sandbox.includes("allow-same-origin"), false);
	assert.equal(isExecutableApkWebPackage("com.example.attacker"), false);
});

test("rejects an untrusted APK before publication", async () => {
	await assert.rejects(() => mountTrustedApkWebView(null, {
		artifactId: "artifact-12345678",
		content: null,
		contentView: {
			web: {
				assetPath: "assets/index.html",
				kind: "apk-asset"
			}
		},
		packageName: "com.example.attacker"
	}), {
		code: "APK_WEB_PACKAGE_UNTRUSTED"
	});
});

test("normalizes package paths and executable MIME types", () => {
	assert.equal(normalizeApkWebPath("assets/modules/main.js"), "modules/main.js");
	assert.equal(apkWebMimeType("modules/main.js"), "text/javascript; charset=utf-8");
	assert.equal(apkWebMimeType("styles/core.css"), "text/css; charset=utf-8");
	assert.throws(() => normalizeApkWebPath("assets/../secret"), {
		code: "APK_WEB_ASSET_PATH_INVALID"
	});
});
