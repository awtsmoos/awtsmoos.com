// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Codec = require("../lib/deviceIdentity/macosStoreCodec.js");
const Store = require("../lib/deviceIdentity/macosStore.js");

/** Proves transient read-only Keychain timeouts retry without weakening fail-closed rules. */
test("read retries transient timeout then returns exact credential", () => {
	let calls = 0;
	const result = Store.read("service", "account", {
		resolveKeychain: () => "/tmp/login.keychain-db",
		run(_executable, _args, options) {
			calls += 1;
			assert.equal(options.timeoutMs, Store.READ_TIMEOUT_MS);
			if (calls < 3) throw new Error("credential_command_failed:ETIMEDOUT");
			return Codec.encode("credential-seven");
		}
	});
	assert.equal(result, "credential-seven");
	assert.equal(calls, 3);
});

test("read retries timeout while resolving login keychain", () => {
	let resolves = 0;
	const result = Store.read("service", "account", {
		resolveKeychain() {
			resolves += 1;
			if (resolves === 1) throw new Error("credential_command_failed:ETIMEDOUT");
			return "/tmp/login.keychain-db";
		},
		run() { return Codec.encode("credential-eight"); }
	});
	assert.equal(result, "credential-eight");
	assert.equal(resolves, 2);
});

test("missing and non-timeout failures remain fail-closed", () => {
	assert.equal(Store.read("service", "account", {
		resolveKeychain: () => "/tmp/login.keychain-db",
		run() { throw new Error("credential_command_rejected:44:not found"); }
	}), null);
	assert.throws(() => Store.read("service", "account", {
		resolveKeychain: () => "/tmp/login.keychain-db",
		run() { throw new Error("credential_command_rejected:36:denied"); }
	}), /credential_command_rejected:36/);
});
