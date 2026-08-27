//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Guest Bootstrap Tests
 * @description The Awtsmoos tests behavior instead of accidental whitespace below;
 * Awtsmoos.com proves hidden roads are cut, fetch becomes host testimony, and only
 * nonce-sealed page JavaScript awakens after navigation containment begins to glow.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { embeddedGuestBootstrap } from "../programs/awtsmoos-browser/embeddedGuestBootstrap.js";

const CHANNEL = "guest_bootstrap_channel";
const NONCE = "nonce_bootstrap_value";

function bootstrap() {
	return embeddedGuestBootstrap(CHANNEL, NONCE);
}

test("requires Navigation API before page scripts are revealed", () => {
	const source = bootstrap();
	assert.match(source, /globalThis\.navigation\?\.addEventListener/);
	assert.match(source, /GUEST_NAVIGATION_API_REQUIRED/);
	assert.match(source, /if\s*\(!navigationReady\)\s*return/);
	assert.match(source, /addEventListener\("navigate",\s*reportNavigation\)/);
	assert.match(source, /event\.preventDefault\(\)/);
});

test("removes active markup roads before HTML reaches the live root", () => {
	const source = bootstrap();
	assert.match(source, /script,base,iframe,object,embed,link\[rel~='stylesheet'\]/);
	assert.match(source, /===\s*"refresh"/);
	assert.match(source, /startsWith\("on"\)/);
	assert.match(source, /root\.innerHTML\s*=\s*cleanMarkup/);
});

test("mediates anchor journeys and window.open through the host", () => {
	const source = bootstrap();
	assert.match(source, /closest\?\.\("a\[href\]"\)/);
	assert.match(source, /navigationType:\s*"link"/);
	assert.match(source, /globalThis\.open\s*=\s*function/);
	assert.match(source, /parent\.postMessage/);
});

test("host-authorized page scripts receive the per-frame nonce", () => {
	const source = bootstrap();
	assert.match(source, /const scriptNonce\s*=\s*"nonce_bootstrap_value"/);
	assert.match(source, /script\.nonce\s*=\s*scriptNonce/);
	assert.match(source, /script\.textContent\s*=\s*source/);
});

test("installs host-mediated Request and fetch before page rendering", () => {
	const source = bootstrap();
	const fetchIndex = source.indexOf("globalThis.fetch = awtsmoosFetch");
	const renderIndex = source.indexOf("function renderGuest");
	assert.notEqual(fetchIndex, -1);
	assert.notEqual(renderIndex, -1);
	assert.ok(fetchIndex > renderIndex);
	assert.match(source, /globalThis\.Request = AwtsmoosVirtualRequest/);
	assert.match(source, /send\("network-request"/);
});

test("settles typed network responses before render and reset routing", () => {
	const source = bootstrap();
	assert.match(source, /message\.type === "network-response"/);
	assert.match(source, /message\.type === "network-error"/);
	assert.match(source, /settleNetworkMessage\(message\.type, message\.payload\)/);
	assert.match(source, /if \(message\.type === "render"\) renderGuest/);
	assert.match(source, /if \(message\.type === "reset"\) resetGuest/);
});

test("channel and nonce literals cannot terminate bootstrap script markup", () => {
	const source = embeddedGuestBootstrap(
		"guest_</script><script>alert(1)</script>",
		"nonce_</script><script>alert(2)</script>"
	);
	assert.equal(source.includes("</script><script>"), false);
	assert.match(source, /\\u003c\/script\\u003e/);
});
