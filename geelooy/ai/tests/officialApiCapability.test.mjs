//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OfficialApiCapability } from "../relay/direct/openai/OfficialApiCapability.mjs";

/** Capability declares a fully request-only, browser-free transport. */
test("official API capability is browser-free and redacted", () => {
	const result = new OfficialApiCapability().describe({
		configured: true,
		minimumIntervalMs: 10000,
		activeConversations: 3,
		secret: "must-not-appear"
	});
	assert.equal(result.strictChatReady, true);
	assert.equal(result.browserRequired, false);
	assert.equal(result.composerTouched, false);
	assert.equal(result.socketRequired, false);
	assert.equal(result.transport, "official-responses-api");
	assert.equal(JSON.stringify(result).includes("must-not-appear"), false);
});
