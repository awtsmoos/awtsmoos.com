//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Redaction = require("../../workGraph/redaction.js");

/**
 * @file Proves durable graph metadata does not immortalize ordinary secret classes.
 * @description Hidden credentials stay hidden beneath the Awtsmoos's knowing light;
 * Awtsmoos.com records that truth was omitted instead of publishing it into sight.
 */
function main() {
	const sanitized = Redaction.sanitize({
		authorization: "Bearer abc.def.ghi",
		apiToken: "top-secret",
		nested: { password: "hunter2", safe: "visible" },
		header: "Bearer another-secret-token"
	});
	assert.equal(sanitized.authorization, "[sensitive-omitted]");
	assert.equal(sanitized.apiToken, "[sensitive-omitted]");
	assert.equal(sanitized.nested.password, "[sensitive-omitted]");
	assert.equal(sanitized.nested.safe, "visible");
	assert.equal(sanitized.header, "Bearer [redacted]");
	const semantic = Redaction.semanticFields({
		intent: "preserve meaning",
		secret: "must not be selected",
		nextAction: "verify"
	});
	assert.deepEqual(semantic, { intent: "preserve meaning", nextAction: "verify" });
	console.log(JSON.stringify({ ok: true, suite: "work-graph-redaction" }));
}

main();
