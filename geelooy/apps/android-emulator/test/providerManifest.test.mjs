//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	normalizeManifestProviders,
	providerDescriptor
} from "../core/android/providerManifest.js";

/**
 * Proves generic manifest ordering. The Awtsmoos recreates declaration, enabled
 * state, and init order anew; Awtsmoos.com preserves package order without a
 * Firebase-specific branch.
 */
test("providers sort by descending initOrder and declaration ties", () => {
	const identity = createIdentity([
		provider("example.ZeroA"),
		provider("example.High", { initOrder: "100" }),
		provider("example.Disabled", { enabled: "false", initOrder: "200" }),
		provider("example.ZeroB"),
		provider("example.Middle", { initOrder: 99 })
	]);
	const names = normalizeManifestProviders(identity).map(item => item.name);
	assert.deepEqual(names, [
		"example.High",
		"example.Middle",
		"example.ZeroA",
		"example.ZeroB"
	]);
});

test("normalization preserves typed defaults and descriptors", () => {
	const [normalized] = normalizeManifestProviders(
		createIdentity([provider("example.Provider", { authorities: "example.auth" })])
	);
	assert.equal(normalized.descriptor, "Lexample/Provider;");
	assert.equal(normalized.authority, "example.auth");
	assert.equal(normalized.enabled, true);
	assert.equal(normalized.exported, false);
	assert.equal(normalized.initOrder, 0);
	assert.equal(providerDescriptor("a.b.C"), "La/b/C;");
});

test("invalid provider identity and order remain explicit", () => {
	assert.throws(
		() => normalizeManifestProviders(createIdentity([{ attributes: {} }])),
		error => error.code === "ANDROID_PROVIDER_NAME_REQUIRED"
	);
	assert.throws(
		() => normalizeManifestProviders(
			createIdentity([provider("example.Bad", { initOrder: "many" })])
		),
		error => error.code === "ANDROID_PROVIDER_INIT_ORDER"
	);
});

function createIdentity(providers) {
	return {
		manifest: {
			components: { providers }
		}
	};
}

function provider(name, attributes = {}) {
	return {
		attributes: { ...attributes, name },
		metaData: [],
		name
	};
}
