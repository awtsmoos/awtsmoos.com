//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OpenAiKeychainSetup } from "../relay/direct/openai/OpenAiKeychainSetup.mjs";

/** Setup opens the official page and asks security to prompt rather than taking a key argument. */
test("Keychain setup never places the secret in command arguments", () => {
	const calls = [];
	const setup = new OpenAiKeychainSetup({
		account: "local-user",
		serviceName: "test-service",
		spawn(command, args, options) {
			calls.push({ command, args, options });
			return { status: 0 };
		}
	});
	setup.openKeyPage();
	setup.storeInteractively();
	assert.deepEqual(calls[0].args, ["https://platform.openai.com/api-keys"]);
	assert.deepEqual(calls[1].args, [
		"add-generic-password",
		"-U",
		"-a",
		"local-user",
		"-s",
		"test-service",
		"-w"
	]);
	assert.equal(calls[1].options.stdio, "inherit");
	assert.equal(calls[1].args.at(-1), "-w");
});
