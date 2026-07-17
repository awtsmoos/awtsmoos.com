//B"H
//Boruch Hashem
//Blessed is He

import { javaByteBufferSnapshot } from "./frameworkJavaByteBufferAccess.js";

const MAXIMUM_EVENTS = 4096;
const MAXIMUM_PAYLOAD_BYTES = 65536;
const TRACE_FIELD = "flutter:platform-message-trace";

/**
 * Records one correlated Flutter platform-message boundary. The Awtsmoos creates
 * request, response, channel, byte shore, and sequence anew; Awtsmoos.com retains
 * bounded immutable evidence without changing or fabricating guest payloads.
 */
export function traceFlutterPlatformMessage(runtime, input) {
	const state = platformMessageTraceState(runtime);
	const replyId = normalizedReplyId(input.replyId);
	const requestSequence = responseDirection(input.direction)
		? state.pending.get(replyId) || null
		: null;
	const event = Object.freeze({
		buffer: bufferEvidence(runtime, input.buffer, input.byteCount),
		channel: String(input.channel || ""),
		direction: input.direction,
		empty: !input.buffer,
		replyId,
		requestSequence,
		sequence: state.nextSequence,
		shellId: normalizedShellId(input.shellId)
	});
	state.nextSequence += 1;
	state.events.push(event);
	if (state.events.length > MAXIMUM_EVENTS) state.events.shift();
	updateCorrelation(state, event);
	return event;
}

/**
 * Returns immutable trace evidence suitable for runtime reports and tests.
 */
export function flutterPlatformMessageTraceSnapshot(runtime) {
	const state = platformMessageTraceState(runtime);
	return Object.freeze(state.events.slice());
}

export function clearFlutterPlatformMessageCorrelation(runtime, replyIdInput) {
	platformMessageTraceState(runtime).pending.delete(
		normalizedReplyId(replyIdInput)
	);
}

function platformMessageTraceState(runtime) {
	if (!runtime[TRACE_FIELD]) {
		runtime[TRACE_FIELD] = {
			events: [],
			nextSequence: 1,
			pending: new Map()
		};
	}
	return runtime[TRACE_FIELD];
}

function bufferEvidence(runtime, reference, declaredByteCount) {
	if (!reference) return null;
	const snapshot = javaByteBufferSnapshot(runtime, reference);
	const requested = Number.isInteger(Number(declaredByteCount))
		? Math.max(0, Number(declaredByteCount))
		: snapshot.position;
	const byteLength = Math.min(requested, snapshot.bytes.length);
	const capturedLength = Math.min(byteLength, MAXIMUM_PAYLOAD_BYTES);
	return Object.freeze({
		byteLength,
		bytes: Object.freeze(snapshot.bytes.slice(0, capturedLength)),
		capacity: snapshot.capacity,
		capturedLength,
		direct: snapshot.direct,
		limit: snapshot.limit,
		position: snapshot.position,
		truncated: capturedLength < byteLength
	});
}

function updateCorrelation(state, event) {
	if (!event.replyId) return;
	if (event.direction === "guest-to-dart") {
		state.pending.set(event.replyId, event.sequence);
		return;
	}
	if (responseDirection(event.direction)) state.pending.delete(event.replyId);
}

function responseDirection(direction) {
	return direction === "dart-to-guest-response";
}

function normalizedReplyId(value) {
	const number = Number(value || 0);
	return Number.isInteger(number) && number >= 0 ? number : 0;
}

function normalizedShellId(value) {
	if (typeof value === "bigint") return value.toString();
	if (Number.isFinite(Number(value))) return String(value || 0);
	return "0";
}
