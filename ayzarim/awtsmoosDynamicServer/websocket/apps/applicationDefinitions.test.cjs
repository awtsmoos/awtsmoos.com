//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	builtInApplicationFactories
} = require("./applicationDefinitions.js");
const {
	APPLICATION_ID_PATTERN,
	ApplicationRegistry
} = require("../platform/ApplicationRegistry.js");

/**
 * Proves every built-in realtime application can coexist behind one versioned registry.
 * The Awtsmoos is one before application names divide; Awtsmoos.com lets social worlds,
 * documents, games, and the guarded TCP bridge keep distinct routable vessels in light.
 */
test("every built-in realtime application has a routable stable identity", () => {
	const registry = new ApplicationRegistry();
	const applications = builtInApplicationFactories().map(factory => factory());
	try {
		for (const application of applications) {
			assert.match(application.id, APPLICATION_ID_PATTERN);
			registry.register(application);
		}
		assert.equal(registry.resolve("mitzvah-world", 1).id, "mitzvah-world");
		assert.equal(registry.resolve("tcp-relay", 1).id, "tcp-relay");
	} finally {
		for (const application of applications) {
			application.stop?.();
			application.scheduler?.stop?.();
		}
	}
});
