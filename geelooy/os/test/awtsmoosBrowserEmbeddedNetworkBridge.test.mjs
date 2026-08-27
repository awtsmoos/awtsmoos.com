//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Network Bridge Tests
 * @description The Awtsmoos follows one host-owned network river from request to return;
 * Awtsmoos.com proves success, foreign redirect rejection, bounded errors, and teardown
 * while race-specific judgments remain in their own smaller vessel beside the shore.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { HostToGuestType } from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";
import {
	EMBEDDED_TEST_PAGE_URL,
	embeddedBridgeFixture,
	embeddedNetworkRequest
} from "./embeddedNetworkBridgeFixture.mjs";

test("successful request reaches transport and returns shaped response", async () => {
	const fixture = embeddedBridgeFixture(async input => ({
		bodyBase64: "b2s=",
		headers: { "content-type": "text/plain" },
		redirects: [],
		status: 200,
		url: input.url
	}));
	await fixture.network.handle(embeddedNetworkRequest());
	assert.equal(fixture.calls.length, 1);
	assert.equal(fixture.calls[0].url, "https://app.example/api");
	assert.equal(fixture.sent[0][0], HostToGuestType.NETWORK_RESPONSE);
	assert.equal(fixture.sent[0][1].id, "net_one");
});

test("cross-origin final redirect becomes a bounded guest error", async () => {
	const fixture = embeddedBridgeFixture(async () => ({
		bodyBase64: "secret",
		headers: {},
		redirects: [{ status: 302 }],
		status: 200,
		url: "https://evil.example/final"
	}));
	await fixture.network.handle(embeddedNetworkRequest());
	assert.equal(fixture.sent[0][0], HostToGuestType.NETWORK_ERROR);
	assert.equal(
		fixture.sent[0][1].code,
		"BROWSER_EMBEDDED_CROSS_ORIGIN_REDIRECT"
	);
});

test("transport failure does not leak internal error text", async () => {
	const fixture = embeddedBridgeFixture(async () => {
		throw new Error("internal detail that guest must never receive");
	});
	await fixture.network.handle(embeddedNetworkRequest());
	assert.deepEqual(fixture.sent[0][1], {
		code: "BROWSER_EMBEDDED_NETWORK_FAILED",
		id: "net_one",
		status: 502
	});
});

test("destroy unsubscribes and suppresses a late transport response", async () => {
	let release;
	const fixture = embeddedBridgeFixture(() => {
		return new Promise(resolve => {
			release = resolve;
		});
	});
	const pending = fixture.network.handle(embeddedNetworkRequest());
	await Promise.resolve();
	fixture.network.destroy();
	assert.equal(fixture.unsubscribed, true);
	release({
		bodyBase64: "",
		headers: {},
		redirects: [],
		status: 204,
		url: EMBEDDED_TEST_PAGE_URL
	});
	await pending;
	assert.deepEqual(fixture.sent, []);
});
