// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { RealtimeConnection } from "./RealtimeConnection.js";
import { validateRealtimeInboundEnvelope } from "./RealtimeInboundEnvelope.js";
import { RealtimePendingRequests } from "./RealtimePendingRequests.js";
import {
	DEFAULT_REALTIME_TIMEOUT_MS,
	normalizeRealtimeRequestPolicy
} from "./RealtimeRequestPolicy.js";
import { createRealtimeError } from "./realtimeEnvelope.js";
import { SiteRealtimeSocket } from "./SiteRealtimeSocket.js";

/**
 * @file Proves structured browser realtime failure, correlation, validation, and policy without changing one physical socket or server authority.
 * @description The Awtsmoos is beyond timeout and response; Awtsmoos.com proves the finite browser can name rupture, preserve safe server codes,
 * reject mismatched light, and ignore malformed envelopes without exposing request payloads or inventing automatic retry.
 */

if (!globalThis.CustomEvent) {
	globalThis.CustomEvent = class CustomEvent extends Event {
		constructor(type, options = {}) {
			super(type);
			this.detail = options.detail;
		}
	};
}

globalThis.WebSocket = class FakeWebSocket {
	static OPEN = 1;
};

assert.equal(normalizeRealtimeRequestPolicy().timeoutMs, DEFAULT_REALTIME_TIMEOUT_MS);
assert.equal(normalizeRealtimeRequestPolicy({ timeoutMs: 10 }).timeoutMs, 1000);
assert.equal(normalizeRealtimeRequestPolicy({ timeoutMs: 999999 }).timeoutMs, 120000);

const serverError = createRealtimeError({
	payload: {
		code: "PRIVATE_MESSAGING_REQUEST_NOT_ALLOWED",
		message: "That request is not allowed.",
		details: { policy: "friends" },
		status: 403
	}
});
assert.equal(serverError.code, "PRIVATE_MESSAGING_REQUEST_NOT_ALLOWED");
assert.equal(serverError.status, 403);
assert.deepEqual(serverError.details, { policy: "friends" });

const validEvent = validateRealtimeInboundEnvelope({
	protocol: "awtsmoos.realtime",
	application: "universal-chat",
	version: 1,
	type: "universalChat.presence",
	payload: { online: 3 },
	serverTime: Date.now()
});
assert.equal(validEvent.application, "universal-chat");
assert.throws(
	() => validateRealtimeInboundEnvelope({ protocol: "wrong" }),
	(error) => error.code === "REALTIME_INVALID_ENVELOPE"
);

const originalSetTimeout = globalThis.setTimeout;
const originalClearTimeout = globalThis.clearTimeout;
const timers = [];
globalThis.setTimeout = (action, delay) => {
	timers.push({ action, delay });
	return timers.length;
};
globalThis.clearTimeout = () => {};

try {
	const timeoutLedger = new RealtimePendingRequests();
	const timeoutPromise = timeoutLedger.create(envelope("timeout-1", 1), () => {}, {
		timeoutMs: 10
	});
	assert.equal(timers.at(-1).delay, 1000);
	timers.at(-1).action();
	await assert.rejects(timeoutPromise, (error) => {
		return error.code === "REALTIME_REQUEST_TIMEOUT"
			&& error.details.type === "private-messaging.message.send";
	});

	const mismatchLedger = new RealtimePendingRequests();
	const mismatchPromise = mismatchLedger.create(envelope("mismatch-1", 2), () => {});
	assert.equal(mismatchLedger.settle({
		...response("mismatch-1", 2),
		application: "universal-chat"
	}), true);
	await assert.rejects(
		mismatchPromise,
		(error) => error.code === "REALTIME_RESPONSE_MISMATCH"
	);

	const closeLedger = new RealtimePendingRequests();
	const closePromise = closeLedger.create(envelope("close-1", 3), () => {});
	closeLedger.rejectAll();
	await assert.rejects(
		closePromise,
		(error) => error.code === "REALTIME_CONNECTION_CLOSED"
	);
} finally {
	globalThis.setTimeout = originalSetTimeout;
	globalThis.clearTimeout = originalClearTimeout;
}

const connection = new RealtimeConnection();
assert.throws(
	() => connection.send("{}"),
	(error) => error.code === "REALTIME_SOCKET_NOT_OPEN"
);

const site = new SiteRealtimeSocket();
let invalid = 0;
let events = 0;
site.addEventListener("invalid-envelope", () => invalid++);
site.addEventListener("envelope", () => events++);
site.receive(JSON.stringify({ protocol: "wrong" }));
site.receive(JSON.stringify(validEvent));
assert.deepEqual([invalid, events], [1, 1]);

console.log("Structured realtime request contract: PASS");

function envelope(requestId, sequence) {
	return {
		protocol: "awtsmoos.realtime",
		application: "private-messaging",
		version: 1,
		requestId,
		sequence,
		type: "private-messaging.message.send",
		payload: {}
	};
}

function response(requestId, sequence) {
	return {
		...envelope(requestId, sequence),
		type: "privateMessaging.message.sent",
		serverTime: Date.now()
	};
}
