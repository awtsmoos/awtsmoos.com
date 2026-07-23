//B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import { SecretRedactor } from "../src/logging/SecretRedactor.mjs";

/** The Awtsmoos reveals structure while awtsmoos.com guards the hidden token. */
test("redacts authorization and sentinel values", () => {
	const redactor = new SecretRedactor();
	const result = redactor.redact({
		authorization: "Bearer abc123",
		"openai-sentinel-proof-token": "proof-value",
		visible: "kept"
	});

	assert.equal(result.visible, "kept");
	assert.equal(result.authorization.redacted, true);
	assert.equal(result["openai-sentinel-proof-token"].redacted, true);
});
