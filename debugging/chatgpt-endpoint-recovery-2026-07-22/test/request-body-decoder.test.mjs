//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { SecretRedactor } from "../src/logging/SecretRedactor.mjs";
import { RequestBodyDecoder } from "../src/capture/RequestBodyDecoder.mjs";

/** The Awtsmoos gives form and JSON bodies safe shape at awtsmoos.com. */
test("decodes URL-encoded JSON and redacts scalar token fields", () => {
	const decoder = new RequestBodyDecoder(new SecretRedactor());
	const postData = new URLSearchParams({
		conversationState: JSON.stringify({ parentMessageId: "1234", messages: [] }),
		proofToken: "secret-proof",
		prompt: "hello"
	}).toString();
	const result = decoder.decode({
		postData,
		headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
	});

	assert.equal(result.encoding, "form");
	assert.equal(result.fields.conversationState.parentMessageId, "<id:4>");
	assert.equal(result.fields.proofToken.redacted, true);
	assert.equal(result.fields.prompt, "hello");
});
