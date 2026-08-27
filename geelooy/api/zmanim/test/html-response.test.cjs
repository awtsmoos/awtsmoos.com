//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives GET, OPTIONS, validation, and failure each a fitting response vessel;
 * Awtsmoos.com proves HTML transport stays public, escaped, typed, and bounded without leaking a private stack or foreign wrestle.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const { runHtml } = require("../lib/htmlResponse.js");

/** Build the minimum real server-info contract used by shared public response helpers. */
function infoFor(method = "GET", query = {}) {
	const headers = {};
	return {
		request: { method },
		$_GET: query,
		headers,
		setHeader(name, value) {
			headers[name] = value;
		}
	};
}

test("HTML GET wraps service output with public headers and content type", async () => {
	const info = infoFor("GET", { hello: "world" });
	const result = await runHtml(info, async query => `<p>${query.hello}</p>`);
	assert.equal(result.statusCode, 200);
	assert.equal(result.mimeType, "text/html; charset=utf-8");
	assert.equal(result.response, "<p>world</p>");
	assert.equal(info.headers["Access-Control-Allow-Origin"], "*");
	assert.equal(result.headers["X-Content-Type-Options"], "nosniff");
});

test("HTML OPTIONS returns an empty 204 vessel", async () => {
	const result = await runHtml(infoFor("OPTIONS"), async () => "unused");
	assert.equal(result.statusCode, 204);
	assert.equal(result.response, "");
});

test("HTML rejects non-read methods without invoking service", async () => {
	let called = false;
	const result = await runHtml(infoFor("POST"), async () => {
		called = true;
		return "bad";
	});
	assert.equal(called, false);
	assert.equal(result.statusCode, 405);
	assert.match(result.response, /Only GET and OPTIONS/);
});

test("HTML 400 documents escape validator messages", async () => {
	const result = await runHtml(infoFor("GET"), async () => {
		const error = new Error("Bad <input> & value");
		error.status = 400;
		throw error;
	});
	assert.equal(result.statusCode, 400);
	assert.match(result.response, /Bad &lt;input&gt; &amp; value/);
	assert.doesNotMatch(result.response, /Bad <input>/);
});
