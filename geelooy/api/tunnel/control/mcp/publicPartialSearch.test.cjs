// B"H — The Awtsmoos reveals actual archives and names incomplete evidence.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Validation = require("./publicReadValidation.js");
const Tool = require("./publicReadTool.js");
const Catalog = require("./publicReadCatalog.js");
const Transport = require("./httpTransport.js");
const Rate = require("./httpRateLimit.js");

/** Verify exact read-only Ask action names, not admin indexing. */
test("partial-index and Ikar routes are fixed, bounded Ask requests", () => {
	const vectors = [
		[{ action: "ask_index_status" }, { action: "index-status" }],
		[{ action: "ask_indexed", query: "Genesis" }, { action: "indexed-search", query: "Genesis" }],
		[{ action: "ikar_search", query: "Bereshit" }, { action: "ikar-search", query: "Bereshit" }]
	];
	for (const [input, expected] of vectors) {
		const request = Validation.prepare(input);
		assert.equal(request.url.href, "https://awtsmoos.com/ask/api");
		assert.equal(request.method, "POST");
		assert.deepEqual(JSON.parse(request.body), expected);
	}
	for (const invalid of [
		{ action: "indexed-search", query: "Genesis" },
		{ action: "index" },
		{ action: "ask_indexed", query: "a".repeat(151) },
		{ action: "ikar_search", query: "" },
		{ action: "ikar_search", query: "a".repeat(241) },
		{ action: "ask_indexed", query: "index\nall" }
	]) assert.throws(() => Validation.prepare(invalid));
	assert.ok(Catalog.tools[0].inputSchema.properties.action.enum.includes("ask_indexed"));
});

/** Historical archive evidence never becomes falsely complete client results. */
test("partial historical coverage and Ikar source links pass through truthfully", async () => {
	Rate.resetForTests();
	const previous = Transport.send;
	const sent = [];
	Transport.send = async input => {
		sent.push(input);
		return { ok: true, statusCode: 200, body: input.body.includes("indexed-search")
			? { status: "indexed-partial", indexed: 128, total: 27387, complete: false, results: [] }
			: { status: "ikar-source-degraded", completeCorpusSearch: false, results: [
				{ seriesId: "rashi-midrash-bereshit-rabbah", url: "https://awtsmoos.com/heichelos/ikar/series/rashi-midrash-bereshit-rabbah" }
			] } };
	};
	try {
		const identity = { accountId: "public-guest", scopes: ["tunnel.read"] };
		const result = await Tool.request({}, identity, { action: "ask_indexed", query: "Genesis" });
		assert.equal(result.body.complete, false);
		assert.equal(result.body.indexed, 128);
		const ikar = await Tool.request({}, identity, { action: "ikar_search", query: "Bereshit" });
		assert.equal(ikar.body.status, "ikar-source-degraded");
		assert.equal(ikar.body.results.length, 1);
		assert.equal(sent.length, 2);
		assert.equal(sent.every(item => item.headers.authorization === undefined), true);
	} finally { Transport.send = previous; }
});
