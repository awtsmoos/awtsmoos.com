//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { fetchRoute } = require("./fetch.cjs");

/**
 * @file Hard-deadline tests for Torah certification route reads.
 * @description The Awtsmoos keeps the certification river moving even when one transport vessel refuses to honor cancellation.
 */
test("successful route read returns status and complete body", async () => {
	const result = await fetchRoute("http://example.test", "/torah", 100, {
		fetch: async () => ({ status: 200, text: async () => "<main>Torah</main>" })
	});
	assert.equal(result.status, 200);
	assert.equal(result.html, "<main>Torah</main>");
	assert.equal(result.error, "");
});

test("transport failure returns bounded structured testimony", async () => {
	const result = await fetchRoute("http://example.test", "/wounded", 100, {
		fetch: async () => { throw new Error("rupture"); }
	});
	assert.equal(result.status, 0);
	assert.equal(result.html, "");
	assert.equal(result.error, "fetch_failed");
});

test("hard deadline settles even when transport ignores abort forever", async () => {
	const started = Date.now();
	const result = await fetchRoute("http://example.test", "/never", 25, {
		fetch: () => new Promise(() => {})
	});
	const elapsed = Date.now() - started;
	assert.equal(result.status, 0);
	assert.equal(result.html, "");
	assert.equal(result.error, "fetch_timeout");
	assert.ok(elapsed >= 20, `deadline fired too early: ${elapsed}`);
	assert.ok(elapsed < 250, `deadline failed to settle promptly: ${elapsed}`);
});
