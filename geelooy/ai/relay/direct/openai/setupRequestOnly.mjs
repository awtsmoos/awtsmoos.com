//B"H
// Boruch Hashem
// Blessed is He

import { OpenAiCredentialResolver } from "./OpenAiCredentialResolver.mjs";
import { OpenAiKeychainSetup } from "./OpenAiKeychainSetup.mjs";
import { OpenAiResponsesClient } from "./OpenAiResponsesClient.mjs";

const expected = "REQUEST ONLY READY.";
const setup = new OpenAiKeychainSetup();

try {
	if (!process.stdin.isTTY) {
		const error = new Error("Run setup in a normal interactive Terminal window.");
		error.code = "setup_terminal_required";
		throw error;
	}
	console.log("B\"H — opening the official OpenAI API key page.");
	console.log("Create a project API key, then return here.");
	console.log("At the hidden Keychain prompt, paste the key and press Return.");
	setup.openKeyPage();
	setup.storeInteractively();
	const resolver = new OpenAiCredentialResolver();
	const status = resolver.describe();
	if (!status.configured) {
		throw coded("setup_keychain_missing", "The Keychain item was not readable.");
	}
	console.log("Credential stored. Sending one small request-only validation call.");
	const result = await new OpenAiResponsesClient({
		credentialResolver: resolver
	}).send({
		prompt: `Reply with exactly: ${expected}`,
		thinkingEffort: "low",
		timeoutMs: 120000
	});
	const exact = result.answer.trim() === expected;
	if (!exact) {
		throw coded("setup_validation_mismatch", "The API replied, but validation text differed.");
	}
	console.log(JSON.stringify({
		status: "ready",
		credentialSource: status.source,
		model: result.model,
		requestOnly: true,
		browserUsed: false,
		domUsed: false,
		validationExact: true
	}, null, 2));
} catch (error) {
	console.error(JSON.stringify({
		status: "setup-failed",
		code: error?.code || "setup_failed",
		message: String(error?.message || error).slice(0, 240),
		hint: "Confirm API billing, key permissions, and OPENAI_MODEL, then rerun setup."
	}, null, 2));
	process.exitCode = 1;
}

function coded(code, message) {
	const error = new Error(message);
	error.code = code;
	return error;
}
