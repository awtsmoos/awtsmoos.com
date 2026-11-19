// B"H — The Awtsmoos denies hidden roads and guards each public destination.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Policy = require("./httpUrlPolicy.js");
const Transport = require("./httpTransport.js");
const Rate = require("./httpRateLimit.js");

/** Verify the public door never disguises a private address as HTTPS. */
test("normalizes only explicitly public HTTPS hosts", () => {
	const target = Policy.normalizeTarget({ mode: "awtsmoos-public", url: "/api/public?x=1" });
	assert.equal(target.href, "https://awtsmoos.com/api/public?x=1");
	assert.equal(Policy.normalizeTarget({ mode: "external", url: "https://example.org/a" }).hostname, "example.org");
	for (const url of [
		"http://example.org/", "https://127.0.0.1/", "https://[::1]/",
		"https://localhost/", "https://foo.internal/", "https://x.local/",
		"https://user:pass@example.org/", "https://example.org:4443/",
		"https://example.org/a#fragment", "https://example.org./",
		"https://0x7f000001/", "//example.org/path"
	]) {
		assert.throws(() => Policy.normalizeTarget({ mode: "external", url }), undefined, url);
	}
	assert.throws(() => Policy.normalizeTarget({ mode: "awtsmoos-public", url: "https://example.org/" }));
	assert.throws(() => Policy.normalizeTarget({ mode: "external", url: "/not-absolute" }));
});

/** Reject familiar private/reserved ranges and public-IP mixing. */
test("public IPv4 policy refuses non-routable and reserved destinations", () => {
	for (const ip of [
		"0.0.0.1", "10.5.1.2", "100.64.1.1", "127.0.0.1",
		"169.254.169.254", "172.20.1.2", "192.0.0.1", "192.168.0.1",
		"192.0.2.11", "198.18.0.1", "198.51.100.9", "203.0.113.3", "224.0.0.1"
	]) assert.equal(Policy.publicIPv4(ip), false, ip);
	assert.equal(Policy.publicIPv4("8.8.8.8"), true);
	assert.equal(Policy.publicIPv4("1.1.1.1"), true);
});

test("DNS pin refuses any private address and never requests the socket", async () => {
	const mixed = async () => ["1.1.1.1", "10.2.3.4"];
	await assert.rejects(Transport.resolvePublicHost("example.org", mixed), /unsafe_dns_destination/);
	assert.equal(await Transport.resolvePublicHost("example.org", async () => ["8.8.8.8"]), "8.8.8.8");
	await assert.rejects(Transport.resolvePublicHost("example.org", async () => []));
	await assert.rejects(Transport.resolvePublicHost("example.org", async () => { throw Error("down"); }), /dns_resolution_failed/);
});

/** The local accounting limit is explicit, caller-scoped and bounded. */
test("rate limits host and caller and provides retry-after", () => {
	Rate.resetForTests();
	const now = 1700000000000;
	for (let i = 0; i < 12; i += 1) assert.equal(Rate.consume("owner-A", "example.org", now).ok, true);
	const denied = Rate.consume("owner-A", "example.org", now);
	assert.equal(denied.statusCode, 429);
	assert.equal(denied.retryAfterSeconds, 60);
	assert.equal(Rate.consume("owner-B", "example.org", now).ok, true);
	assert.equal(Rate.consume("owner-A", "other.org", now).ok, true);
	assert.equal(Rate.consume("owner-A", "example.org", now + 61000).ok, true);
});
