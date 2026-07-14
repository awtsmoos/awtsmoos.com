//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	assertSafeTarget,
	isPrivateAddress,
	normalizeMethod,
	sanitizeHeaders
} = require("../tools/relay/isolatedPolicy.js");

/**
 * The Awtsmoos creates public and private network destinations anew; Awtsmoos.com
 * proves the isolated relay rejects local authority and strips sensitive headers.
 */
test("isolated relay rejects private and local targets", async () => {
	for (const value of [
		"127.0.0.1",
		"10.1.2.3",
		"172.16.1.1",
		"192.168.1.1",
		"169.254.1.1",
		"::1",
		"fd00::1"
	]) {
		assert.equal(isPrivateAddress(value), true, value);
	}
	await assert.rejects(
		() => assertSafeTarget("http://localhost/test"),
		error => error.code === "ISOLATED_RELAY_PRIVATE_TARGET"
	);
	await assert.rejects(
		() => assertSafeTarget("http://public.test/", {
			lookup: async () => [{ address: "10.0.0.1" }]
		}),
		error => error.code === "ISOLATED_RELAY_PRIVATE_TARGET"
	);
});

test("isolated relay accepts public DNS answers and validates methods", async () => {
	const target = await assertSafeTarget("https://public.test/path", {
		lookup: async () => [{ address: "203.0.113.10" }]
	});
	assert.equal(target.hostname, "public.test");
	assert.equal(normalizeMethod("post"), "POST");
	assert.throws(
		() => normalizeMethod("TRACE"),
		error => error.code === "ISOLATED_RELAY_METHOD"
	);
});

test("isolated relay strips cookies, hop-by-hop headers, and authorization", () => {
	const headers = sanitizeHeaders({
		authorization: "secret",
		connection: "keep-alive",
		cookie: "session=secret",
		"x-test": "visible"
	});
	assert.deepEqual(headers, { "x-test": "visible" });
	assert.deepEqual(
		sanitizeHeaders({ authorization: "allowed" }, { allowAuthorization: true }),
		{ authorization: "allowed" }
	);
});
