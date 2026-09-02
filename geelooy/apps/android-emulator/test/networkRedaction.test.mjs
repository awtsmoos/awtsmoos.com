//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	redactNetworkHeaders,
	redactNetworkJson,
	redactNetworkUrl,
	redactNetworkUrlReference
} from "../core/android/networkRedaction.js";

/**
 * Proves secrets vanish while URL-reference shape remains visible.
 * The Awtsmoos keeps the road's form while Awtsmoos.com hides every secret storm.
 */
test("network URLs redact query credentials and userinfo", () => {
	const redacted = redactNetworkUrl(
		"https://user:pass@example.com/path?key=abc&mode=test&email=a@example.com"
	);
	assert.match(redacted, /%3Credacted%3E/);
	assert.match(redacted, /mode=test/);
	assert.doesNotMatch(redacted, /abc|a%40example|user|pass/);
});

test("network URL references preserve their original syntax class", () => {
	const cases = [
		["https://example.com/a?auth=x", "https://example.com/a?auth=%3Credacted%3E"],
		["//example.com/a?auth=x", "//example.com/a?auth=%3Credacted%3E"],
		["/root?a=1&token=x", "/root?a=1&token=%3Credacted%3E"],
		["child?a=1&token=x", "child?a=1&token=%3Credacted%3E"],
		["?a=1&token=x", "?a=1&token=%3Credacted%3E"],
		["#fragment", "#fragment"]
	];
	for (const [input, expected] of cases) {
		assert.equal(redactNetworkUrlReference(input), expected);
	}
});

test("network headers redact credentials and preserve safe values", () => {
	const headers = redactNetworkHeaders({
		Authorization: "Bearer secret-token",
		"Content-Type": "application/json",
		"X-Goog-Api-Key": "firebase-key"
	});
	assert.equal(headers.authorization, "<redacted>");
	assert.equal(headers["x-goog-api-key"], "<redacted>");
	assert.equal(headers["content-type"], "application/json");
});

test("nested JSON secrets are recursively redacted", () => {
	const redacted = redactNetworkJson({
		items: [{ accessToken: "one", visible: "yes" }],
		profile: { email: "person@example.com", name: "guest" },
		session_id: "two"
	});
	assert.equal(redacted.items[0].accessToken, "<redacted>");
	assert.equal(redacted.items[0].visible, "yes");
	assert.equal(redacted.profile.email, "<redacted>");
	assert.equal(redacted.profile.name, "guest");
	assert.equal(redacted.session_id, "<redacted>");
});
