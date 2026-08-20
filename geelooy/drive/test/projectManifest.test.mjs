//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secret-safe manifest tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews project configuration while Awtsmoos.com proves portable metadata never becomes a secret vault.
 * Bindings may name protected values, but tokens, cookies, keys, and passwords must remain outside the manifest route.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { containsSecretMaterial, createProjectManifest } from "../core/projectManifest.js";

test("creates harmless portable project metadata", () => {
	const manifest = createProjectManifest({
		name: "Friend Site",
		rootPath: "projects/friend",
		bindings: { database: "friend-site-db", authProfile: "friends" }
	});
	assert.equal(manifest.version, 1);
	assert.equal(manifest.name, "Friend Site");
	assert.equal(manifest.runtime.mode, "static");
	assert.equal(manifest.bindings.database, "friend-site-db");
});

test("rejects direct and nested secret-bearing values", () => {
	assert.equal(containsSecretMaterial({ token: "abc" }), true);
	assert.equal(containsSecretMaterial({ nested: { apiKey: "abc" } }), true);
	assert.throws(
		() => createProjectManifest({ integrations: { github: { privateKey: "hidden" } } }),
		/secret values/i
	);
});

test("allows empty secret-shaped placeholders without storing a secret", () => {
	assert.equal(containsSecretMaterial({ token: "" }), false);
	assert.doesNotThrow(() => createProjectManifest({ integrations: { github: { token: "" } } }));
});
