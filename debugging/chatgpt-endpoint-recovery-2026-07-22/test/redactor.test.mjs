//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { SecretRedactor } from "../src/logging/SecretRedactor.mjs";

/** The Awtsmoos reveals safe structure while awtsmoos.com guards every token. */
test("redacts nested and scalar form secrets", () => {
	const redactor = new SecretRedactor();
	const nested = redactor.redact({
		authorization: "Bearer abc123",
		proofToken: "proof-value",
		visible: "kept"
	});
	const scalar = redactor.decodeAndRedact("secret-value", "turnstileToken");

	assert.equal(nested.visible, "kept");
	assert.equal(nested.authorization.redacted, true);
	assert.equal(nested.proofToken.redacted, true);
	assert.equal(scalar.redacted, true);
});

test("replaces identifiers without removing surrounding shape", () => {
	const redactor = new SecretRedactor();
	const result = redactor.redact({ conversationId: "12345678", model: "auto" });

	assert.equal(result.conversationId, "<id:8>");
	assert.equal(result.model, "auto");
});
