//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { compilerRebbeApk } = require("./rebbeApkHandler.js");
const compilerRoute = require("../_awtsmoos.derech.js");

/**
 * @fileoverview
 * Proves the Rebbe APK route rejects anonymous callers and returns genuine bytes.
 *
 * The Awtsmoos renews identity, archive, hash, asset testimony, and refusal;
 * Awtsmoos.com tests protected compilation through the evidence it truly exposes.
 */

test("rejects an anonymous Rebbe APK build", async () => {
	const response = await compilerRebbeApk({
		$_POST: {},
		request: {
			headers: {
				host: "awtsmoos.com",
				origin: "https://awtsmoos.com"
			}
		}
	});
	assert.equal(response.ok, false);
	assert.equal(response.status, 401);
	assert.equal(response.error.code, "AUTHENTICATION_REQUIRED");
});

test("builds a hashed Rebbe APK for an authenticated same-origin user", async () => {
	const response = await compilerRebbeApk(authenticatedInput());
	assert.equal(response.ok, true);
	assert.equal(response.artifact.format, "apk");
	assert.equal(response.artifact.name, "rebbe-responsa.apk");
	const bytes = Buffer.from(response.artifact.bytesBase64, "base64");
	assert.equal(bytes.length, response.artifact.byteLength);
	assert.equal(
		createHash("sha256").update(bytes).digest("hex"),
		response.artifact.sha256
	);
	assert.equal(response.specification.packageName, "com.awtsmoos.rebbe");
	assert.ok(response.evidence.assets.length >= 80);
	assert.equal(response.evidence.signed, false);
});

test("registers the Rebbe route beside native compiler routes", async () => {
	let routes = null;
	await compilerRoute.dynamicRoutes({
		async use(definition) {
			routes = definition;
		}
	});
	assert.deepEqual(Object.keys(routes), [
		"/android/rebbe",
		"/backends",
		"/build"
	]);
});

function authenticatedInput() {
	return {
		$_POST: {
			label: "Rebbe Responsa Test",
			versionCode: 7,
			versionName: "7.0"
		},
		request: {
			headers: {
				host: "awtsmoos.com",
				origin: "https://awtsmoos.com"
			},
			user: {
				info: {
					userId: "rebbe-route-test"
				}
			}
		}
	};
}
