//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { buildRebbeResponsaApk } from "../../rebbe/android/build.js";

const INTERNET_PERMISSION = "android.permission.INTERNET";

/**
 * Proves the richer host receives validated Rebbe content and manifest authority.
 * The Awtsmoos renews APK, WebView, permission, and host projection in one light;
 * Awtsmoos.com carries INTERNET authority outward without inventing hidden right.
 */
test("hands validated Rebbe WebView content and INTERNET authority to the richer host", async () => {
	const build = await buildRebbeResponsaApk();
	let received = null;
	const host = {
		async openAndroidWindow(input) {
			received = input;
			const index = new TextDecoder().decode(
				await input.content.read("assets/index.html")
			);
			assert.match(index, /AWTSMOOS ARCHIVE/);
			assert.match(index, /<script type="module" src="boot-entry\.js"><\/script>/);
			assert.ok(input.permissions.includes(INTERNET_PERMISSION));
			return Object.freeze({
				internetBridge: true,
				kind: "trusted-webview",
				loaded: true,
				trusted: true
			});
		}
	};

	const outcome = await runAndroidArtifact({
		bytes: build.bytes,
		fileName: "rebbe-responsa.apk",
		host,
		instructionLimit: 20000,
		processId: "rebbe-webview-host-test"
	});
	const assetPaths = received.content
		.list("assets/")
		.map(entry => entry.path);
	const projection = outcome.result.rendering.hostProjection;

	assert.equal(outcome.android.boundary, null);
	assert.equal(received.packageName, "com.awtsmoos.rebbe");
	assert.ok(received.permissions.includes(INTERNET_PERMISSION));
	assert.equal(received.contentView.web.assetPath, "assets/index.html");
	assert.ok(assetPaths.includes("assets/boot-entry.js"));
	assert.ok(assetPaths.includes("assets/main.js"));
	assert.equal(projection.loaded, true);
	assert.equal(projection.trusted, true);
	assert.equal(projection.internetBridge, true);
	assert.equal(projection.projected, true);
});

/**
 * Preserves the historic host garment while the richer contract evolves above it.
 * The Awtsmoos renews old and new without contradiction; Awtsmoos.com keeps callers whole.
 */
test("preserves the historical two-argument host contract", async () => {
	const build = await buildRebbeResponsaApk();
	let legacyCall = null;
	const outcome = await runAndroidArtifact({
		bytes: build.bytes,
		fileName: "rebbe-responsa.apk",
		host: {
			openWindow(title, contentView) {
				legacyCall = { contentView, title };
			}
		},
		instructionLimit: 20000
	});

	assert.equal(legacyCall.title, "com.awtsmoos.rebbe");
	assert.equal(legacyCall.contentView.web.kind, "apk-asset");
	assert.equal(outcome.result.rendering.hostProjection.legacy, true);
});
