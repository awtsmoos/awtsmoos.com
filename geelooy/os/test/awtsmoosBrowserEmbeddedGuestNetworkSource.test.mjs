//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Guest Network Source Tests
 * @description The Awtsmoos inspects the guest road before page code may travel;
 * Awtsmoos.com proves native Request and Response garments remain, while pending IDs,
 * aborts, timeouts, and typed host messages replace every ambient network channel.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { embeddedGuestNetworkCodecSource } from "../programs/awtsmoos-browser/embeddedGuestNetworkCodecSource.js";
import { embeddedGuestNetworkRequestSource } from "../programs/awtsmoos-browser/embeddedGuestNetworkRequestSource.js";
import { embeddedGuestNetworkLifecycleSource } from "../programs/awtsmoos-browser/embeddedGuestNetworkLifecycleSource.js";
import { GuestToHostType, HostToGuestType } from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";

function sources() {
	return {
		codec: embeddedGuestNetworkCodecSource(),
		request: embeddedGuestNetworkRequestSource(),
		lifecycle: embeddedGuestNetworkLifecycleSource({
			request: GuestToHostType.NETWORK_REQUEST,
			response: HostToGuestType.NETWORK_RESPONSE
		})
	};
}

test("generated network sources are valid JavaScript when composed", () => {
	const value = sources();
	assert.doesNotThrow(() => new Function(`${value.codec}\n${value.request}\n${value.lifecycle}`));
});

test("codec reconstructs real Response objects and fetch-like errors", () => {
	const source = sources().codec;
	assert.match(source, /new Response\(body/);
	assert.match(source, /new TypeError\("Failed to fetch"\)/);
	assert.match(source, /status === 204 \|\| status === 205 \|\| status === 304/);
	assert.match(source, /Object\.defineProperty\(response, "url"/);
	assert.match(source, /Object\.defineProperty\(response, "redirected"/);
});

test("request source preserves native Request semantics and bounds bodies", () => {
	const source = sources().request;
	assert.match(source, /const NativeRequest = globalThis\.Request/);
	assert.match(source, /class AwtsmoosVirtualRequest extends NativeRequest/);
	assert.match(source, /super\(resolvedUrl\(input\), init\)/);
	assert.match(source, /globalThis\.Request = AwtsmoosVirtualRequest/);
	assert.match(source, /MAX_NETWORK_BODY_BYTES = 1048576/);
	assert.match(source, /request\.clone\(\)\.arrayBuffer\(\)/);
	assert.match(source, /credentials: request\.credentials/);
	assert.match(source, /mode: request\.mode/);
	assert.match(source, /redirect: request\.redirect/);
});

test("lifecycle replaces ambient fetch with bounded typed host requests", () => {
	const source = sources().lifecycle;
	assert.match(source, /pendingNetworkRequests = new Map\(\)/);
	assert.match(source, /pendingNetworkRequests\.size >= 16/);
	assert.match(source, /BROWSER_EMBEDDED_NETWORK_TIMEOUT/);
	assert.match(source, /new DOMException\("The operation was aborted\.", "AbortError"\)/);
	assert.match(source, /send\("network-request"/);
	assert.match(source, /globalThis\.fetch = awtsmoosFetch/);
	assert.equal(source.includes("NativeFetch"), false);
	assert.equal(source.includes("globalThis.fetch("), false);
});

test("response settlement clears matching pending request before resolution", () => {
	const source = sources().lifecycle;
	assert.match(source, /clearPendingNetworkRequest\(String\(payload\?\.id \|\| ""\)\)/);
	assert.match(source, /pending\.resolve\(responseFromNetworkPayload\(payload\)\)/);
	assert.match(source, /pending\.reject\(networkFetchError\(payload\?\.code\)\)/);
	assert.match(source, /removeEventListener\("abort", pending\.abortListener\)/);
});
