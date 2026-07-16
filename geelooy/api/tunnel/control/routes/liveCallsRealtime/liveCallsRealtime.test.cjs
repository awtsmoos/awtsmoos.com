// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");

/**
 * @file Proves legacy live-call responses gain redacted account lifecycle events.
 * @description
 * The Awtsmoos renews old route behavior and new account testimony without mixture.
 * Awtsmoos.com injects a disposable legacy vessel, observes snapshots and SSE close,
 * and proves secret conversation text never crosses into the realtime activity ledger.
 */

test("decorates snapshot and stream without publishing raw conversation text", async () => {
	const legacyPath = require.resolve("../liveCalls.js");
	require.cache[legacyPath] = {
		id: legacyPath,
		filename: legacyPath,
		loaded: true,
		exports: createLegacyMock()
	};
	const wrapperPath = require.resolve("../liveCallsRealtime.js");
	delete require.cache[wrapperPath];
	const Wrapper = require("../liveCallsRealtime.js");
	const published = [];
	const context = createContext(published);
	const snapshot = await Wrapper.liveCalls(context);
	assert.equal(JSON.parse(snapshot).conversationId, "conversation-a");
	await Wrapper.liveCallsStream(context);
	assert.deepEqual(
		published.map((entry) => entry.eventType),
		[
			"live_call.snapshot",
			"live_call.stream_opened",
			"live_call.snapshot",
			"live_call.stream_closed"
		]
	);
	assert.equal(
		JSON.stringify(published).includes("secret-conversation-message"),
		false
	);
	assert.ok(published.every((entry) => entry.accountId === "account-a"));
});

function createLegacyMock() {
	return {
		async liveCalls() {
			return JSON.stringify({
				conversationId: "conversation-a",
				sequence: 4,
				changes: [{ content: "secret-conversation-message" }],
				active: [{ id: "call-a" }]
			});
		},
		async liveCallsStream(context) {
			context.response.write([
				"event: snapshot",
				"data: {\"conversationId\":\"conversation-a\",\"sequence\":5,\"changes\":[{\"content\":\"secret-conversation-message\"}],\"active\":[{\"id\":\"call-a\"}]}",
				"",
				""
			].join("\n"));
			context.request.emit("close");
			return "stream-complete";
		}
	};
}

function createContext(published) {
	const request = new EventEmitter();
	request.headers = {};
	request.user = {
		authorized: true,
		info: {
			userId: "user-a",
			accountId: "account-a",
			sessionId: "session-a"
		}
	};
	const response = new EventEmitter();
	response.write = () => true;
	return {
		request,
		response,
		ws: {
			publishActivity(event) {
				published.push(event);
				return event;
			}
		}
	};
}
