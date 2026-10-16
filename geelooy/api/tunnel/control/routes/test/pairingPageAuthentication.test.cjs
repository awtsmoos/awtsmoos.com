//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { pairingPageHtml } = require("../pairingPage.js");

/** Login must be prompted when a dynamic route returns HTTP 200 with auth error. */
test("approval page redirects on not_authenticated body, including HTTP 200 envelopes", () => {
	const markup = pairingPageHtml({ pairingCode: "ABCDEFGH23", pairingId: "pair_test" });
	assert(markup.includes('data.error==="not_authenticated"'));
	assert(markup.includes('location.href="/login?return="+back'));
	assert(markup.includes("ABCDE-FGH23"));
	assert(!markup.includes("VERIFICATION LINK"));
});
