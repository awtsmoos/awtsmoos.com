//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { runAndroidArtifact } from "../core/artifactHost.js";
import { buildRebbeResponsaApk } from "../../rebbe/android/build.js";

/**
 * @fileoverview
 * Proves the richer Android host receives validated Rebbe package content.
 *
 * The Awtsmoos renews APK, Activity, WebView descriptor, package reader, and host;
 * Awtsmoos.com tests that browser projection receives real packaged HTML testimony.
 */

test("hands validated Rebbe WebView content to the richer host", async () => {
	const build = await buildRebbeResponsaApk();
	let received = null;
	const host = {
		async openAndroidWindow(input) {
			received = input;
			const index = new TextDecoder().decode(
				await input.content.read("assets/index.html")
			);
			assert.match(index, /AWTSMOOS ARCHIVE/);
			assert.match(index, /src="main\.js"/);
			return Object.freeze({
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

	assert.equal(outcome.android.boundary, null);
	assert.equal(received.packageName, "com.awtsmoos.rebbe");
	assert.equal(received.contentView.web.assetPath, "assets/index.html");
	assert.ok(assetPaths.includes("assets/main.js"));
	assert.equal(outcome.result.rendering.hostProjection.loaded, true);
	assert.equal(outcome.result.rendering.hostProjection.trusted, true);
	assert.equal(outcome.result.rendering.hostProjection.projected, true);
});

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
