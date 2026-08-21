//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Network Concurrency Tests
 * @description The Awtsmoos keeps every request in its own counted vessel;
 * Awtsmoos.com proves a duplicate cannot steal or release another request's place,
 * while the bounded river refuses excess crossings until an honest slot returns.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { HostToGuestType } from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";
import {
	EMBEDDED_TEST_PAGE_URL,
	embeddedBridgeFixture,
	embeddedNetworkRequest
} from "./embeddedNetworkBridgeFixture.mjs";

test("duplicate ID cannot release the original in-flight reservation", async () => {
	let release;
	const fixture = embeddedBridgeFixture(() => {
		return new Promise(resolve => {
			release = resolve;
		});
	});
	const first = fixture.network.handle(embeddedNetworkRequest("net_same"));
	await Promise.resolve();
	await fixture.network.handle(embeddedNetworkRequest("net_same"));
	assert.equal(fixture.network.activeIds.has("net_same"), true);
	assert.deepEqual(fixture.sent[0], [
		HostToGuestType.NETWORK_ERROR,
		{
			code: "BROWSER_EMBEDDED_REQUEST_DUPLICATE",
			id: "net_same",
			status: 409
		}
	]);
	release(successResponse());
	await first;
	assert.equal(fixture.network.activeIds.has("net_same"), false);
});

test("max concurrency rejects another request until occupied slot returns", async () => {
	let release;
	const fixture = embeddedBridgeFixture(() => {
		return new Promise(resolve => {
			release = resolve;
		});
	}, 1);
	const first = fixture.network.handle(embeddedNetworkRequest("net_one"));
	await Promise.resolve();
	await fixture.network.handle(embeddedNetworkRequest("net_two"));
	assert.equal(fixture.sent[0][0], HostToGuestType.NETWORK_ERROR);
	assert.equal(
		fixture.sent[0][1].code,
		"BROWSER_EMBEDDED_REQUEST_CONCURRENCY"
	);
	assert.equal(fixture.network.activeIds.has("net_one"), true);
	release(successResponse());
	await first;
	assert.equal(fixture.network.activeIds.size, 0);
});

function successResponse() {
	return {
		bodyBase64: "",
		headers: {},
		redirects: [],
		status: 204,
		url: EMBEDDED_TEST_PAGE_URL
	};
}
