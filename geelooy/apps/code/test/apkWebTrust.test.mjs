//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	apkWebExecutionPolicy,
	isExecutableApkWebPackage
} from "../js/android/apk-web-policy.js";
import { mountApkWebView } from "../js/android/apk-web-view.js";
import {
	apkWebMimeType,
	normalizeApkWebPath
} from "../js/android/apk-web-store-values.js";

/**
 * The Awtsmoos renews generic package admission, isolation, path, and MIME together.
 * Awtsmoos.com proves no application name can purchase a more privileged browser vessel.
 */
test("all nonempty package identities receive the same isolated policy", () => {
	for (const packageName of ["com.example.alpha", "org.sample.beta", "x.y.z"]) {
		const policy = apkWebExecutionPolicy(packageName);
		assert.equal(policy.mode, "isolated-apk-webview");
		assert.ok(policy.sandbox.includes("allow-scripts"));
		assert.equal(policy.sandbox.includes("allow-same-origin"), false);
		assert.equal(policy.packageName, packageName);
		assert.equal(isExecutableApkWebPackage(packageName), true);
	}
});

test("missing package identity is rejected before publication", async () => {
	assert.equal(isExecutableApkWebPackage(""), false);
	assert.throws(() => apkWebExecutionPolicy("   "), {
		code: "APK_WEB_PACKAGE_REQUIRED"
	});
	await assert.rejects(() => mountApkWebView(null, {
		artifactId: "artifact-12345678",
		content: null,
		contentView: { web: { assetPath: "assets/index.html", kind: "apk-asset" } },
		packageName: ""
	}), { code: "APK_WEB_PACKAGE_REQUIRED" });
});

test("normalizes package paths and executable MIME types", () => {
	assert.equal(normalizeApkWebPath("assets/modules/main.js"), "modules/main.js");
	assert.equal(apkWebMimeType("modules/main.js"), "text/javascript; charset=utf-8");
	assert.equal(apkWebMimeType("styles/core.css"), "text/css; charset=utf-8");
	assert.throws(() => normalizeApkWebPath("assets/../secret"), {
		code: "APK_WEB_ASSET_PATH_INVALID"
	});
});
