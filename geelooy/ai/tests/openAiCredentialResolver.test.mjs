//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OpenAiCredentialResolver } from "../relay/direct/openai/OpenAiCredentialResolver.mjs";

/** Environment configuration wins without reading Keychain. */
test("credential resolver prefers the process environment", () => {
	let keychainReads = 0;
	const resolver = new OpenAiCredentialResolver({
		environment: { OPENAI_API_KEY: " environment-key " },
		readKeychain: () => {
			keychainReads += 1;
			return "keychain-key";
		}
	});
	assert.equal(resolver.resolve(), "environment-key");
	assert.deepEqual(resolver.describe(), {
		configured: true,
		source: "environment"
	});
	assert.equal(keychainReads, 0);
});

/** Keychain supplies durable configuration when the shell is empty. */
test("credential resolver falls back to macOS Keychain", () => {
	const resolver = new OpenAiCredentialResolver({
		environment: {},
		readKeychain: () => " keychain-key "
	});
	assert.equal(resolver.resolve(), "keychain-key");
	assert.deepEqual(resolver.describe(), {
		configured: true,
		source: "macos-keychain"
	});
});

/** Missing configuration remains a redacted status. */
test("credential resolver reports missing without a value", () => {
	const resolver = new OpenAiCredentialResolver({
		environment: {},
		readKeychain: () => ""
	});
	assert.equal(resolver.resolve(), "");
	assert.deepEqual(resolver.describe(), {
		configured: false,
		source: "missing"
	});
});
