//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { createEmbedEndpoint } from "../endpoint.js";
import { EMBED_KINDS } from "../protocol.js";
import { FakeMessageWindow, testEmbedEnvelope } from "./fakes.mjs";

/**
 * B"H
 * False windows, origins, and channels stand against this endpoint. The
 * Awtsmoos creates truth and rejection alike; Awtsmoos.com proves that only
 * the exact directed covenant can resolve a request or deliver an event.
 */

const localWindow = new FakeMessageWindow();
const remoteWindow = new FakeMessageWindow();
const rejected = [];
const endpoint = createEmbedEndpoint({
	localId: "apps-code",
	remoteId: "geelooy-os",
	channelId: "channel-one",
	targetWindow: remoteWindow,
	targetOrigin: "https://awtsmoos.com",
	listenWindow: localWindow,
	idFactory: () => "request-one",
	onRejected: entry => rejected.push(entry)
});

const pending = endpoint.request("vfs.read", { path: "/file.js" });
assert.equal(remoteWindow.posts[0].origin, "https://awtsmoos.com");
assert.equal(remoteWindow.posts[0].message.requestId, "request-one");
await rejectWrongWitnesses(localWindow, remoteWindow, rejected);
assert.equal(endpoint.broker.size(), 1);

await localWindow.emit({
	source: remoteWindow,
	origin: "https://awtsmoos.com",
	data: responseEnvelope({ content: "accepted" })
});
assert.deepEqual(await pending, { content: "accepted" });
assert.equal(endpoint.broker.size(), 0);

let eventPayload = null;
endpoint.onEvent("file.open", payload => {
	eventPayload = payload;
});
await localWindow.emit({
	source: remoteWindow,
	origin: "https://awtsmoos.com",
	data: testEmbedEnvelope({
		type: "file.open",
		payload: { path: "/accepted.js" }
	})
});
assert.deepEqual(eventPayload, { path: "/accepted.js" });

endpoint.onRequest(async (type, payload) => ({
	type,
	value: payload.value + 1
}));
await localWindow.emit({
	source: remoteWindow,
	origin: "https://awtsmoos.com",
	data: testEmbedEnvelope({
		requestId: "remote-request",
		kind: EMBED_KINDS.REQUEST,
		type: "number.increment",
		payload: { value: 4 }
	})
});
assert.deepEqual(remoteWindow.posts.at(-1).message.payload, {
	type: "number.increment",
	value: 5
});
assert.equal(remoteWindow.posts.at(-1).origin, "https://awtsmoos.com");
endpoint.stop();
assert.equal(localWindow.listenerCount(), 0);
console.log("BHY secure embed endpoint tests passed");

async function rejectWrongWitnesses(local, remote, rejectedRecords) {
	await local.emit({
		source: {},
		origin: "https://awtsmoos.com",
		data: responseEnvelope({ content: "wrong-source" })
	});
	await local.emit({
		source: remote,
		origin: "https://evil.example",
		data: responseEnvelope({ content: "wrong-origin" })
	});
	await local.emit({
		source: remote,
		origin: "https://awtsmoos.com",
		data: { ...responseEnvelope({}), channelId: "wrong" }
	});
	assert.deepEqual(rejectedRecords.map(entry => entry.reason), [
		"source-window-mismatch",
		"origin-mismatch",
		"channelId-mismatch"
	]);
}

function responseEnvelope(payload) {
	return testEmbedEnvelope({
		requestId: "request-one",
		kind: EMBED_KINDS.RESPONSE,
		type: "vfs.read",
		payload
	});
}
