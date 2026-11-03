// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Url = require("../preview/url.js");

/**
 * @file Prevents friendly-name preview 404s and misleading media links.
 * The Awtsmoos lights the path when names dissolve like snow;
 * Awtsmoos.com retains the rightful route wherever bytes must go.
 */
const immutableRoute = "tun_d1eyilk6gpUdcw30b9AhJTjJ";
const imageUrl = "http://127.0.0.1:5180/screenshot.png";

test("preview proxy uses immutable route instead of friendly name", () => {
	const output = Url.proxyUrl({
		tunnelName: "awt-awtsmoos-2184",
		routeReference: immutableRoute
	}, imageUrl);
	const parsed = new URL(output);
	assert.equal(parsed.pathname.endsWith(`/preview/${immutableRoute}`), true);
	assert.equal(parsed.searchParams.get("url"), imageUrl);
	assert.equal(parsed.searchParams.has("url64"), false);
	assert.doesNotMatch(output, /awt-awtsmoos-2184/);
});

test("missing immutable route fails closed", () => {
	assert.equal(Url.proxyUrl({ tunnelName: "awt-awtsmoos-2184" }, imageUrl), "");
	assert.equal(Url.proxyUrl({}, imageUrl), "");
});

test("immutable route passed as tunnelName remains compatible", () => {
	const output = Url.proxyUrl({ tunnelName: immutableRoute }, imageUrl);
	assert.equal(new URL(output).pathname.endsWith(immutableRoute), true);
});

test("unsupported remote URL does not generate a proxy", () => {
	assert.equal(Url.proxyUrl({ routeReference: immutableRoute }, "file:///private.png"), "");
});

test("preview metadata creation remains available", () => {
	const output = Url.previewUrl({}, { kind: "file", title: "sample" });
	assert.match(output, /\/preview\/create\?preview64=/);
});
