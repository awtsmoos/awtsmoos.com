//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Tests guard the borders through which many applications share one doorway.
 * The Awtsmoos renews every registry instance; Awtsmoos.com proves names,
 * versions, and historical message claims cannot collide or leak after failure.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ApplicationRegistry } = require("./ApplicationRegistry.js");

function application(id, legacyTypes = [], versions = [1]) {
	return {
		id,
		legacyTypes,
		versions
	};
}

test("registers independent applications and resolves legacy ownership", () => {
	const registry = new ApplicationRegistry();
	registry.register(application("alpha-app", ["ALPHA"]));
	registry.register(application("beta-app", ["BETA"], [1, 2]));

	assert.equal(registry.resolveLegacy("ALPHA").id, "alpha-app");
	assert.equal(registry.resolve("beta-app", 2).id, "beta-app");
	assert.deepEqual(registry.list(), [
		{ id: "alpha-app", versions: [1] },
		{ id: "beta-app", versions: [1, 2] }
	]);
});

test("rejects duplicate application identifiers", () => {
	const registry = new ApplicationRegistry();
	registry.register(application("alpha-app"));
	assert.throws(
		() => registry.register(application("alpha-app")),
		/already registered/
	);
});

test("rejects duplicate legacy message claims", () => {
	const registry = new ApplicationRegistry();
	registry.register(application("alpha-app", ["SHARED"]));
	assert.throws(
		() => registry.register(application("beta-app", ["SHARED"])),
		/already registered/
	);
});

test("failed registration leaves no partial legacy claims", () => {
	const registry = new ApplicationRegistry();
	registry.register(application("alpha-app", ["SHARED"]));
	assert.throws(
		() => registry.register(application("beta-app", ["FREE", "SHARED"])),
		/already registered/
	);
	assert.equal(registry.resolveLegacy("FREE"), null);
	registry.register(application("gamma-app", ["FREE"]));
	assert.equal(registry.resolveLegacy("FREE").id, "gamma-app");
});

test("returns structured errors for unknown apps and versions", () => {
	const registry = new ApplicationRegistry();
	registry.register(application("alpha-app"));
	assert.throws(
		() => registry.resolve("missing-app", 1),
		error => error.code === "UNKNOWN_APPLICATION"
	);
	assert.throws(
		() => registry.resolve("alpha-app", 9),
		error => error.code === "UNSUPPORTED_VERSION"
	);
});
