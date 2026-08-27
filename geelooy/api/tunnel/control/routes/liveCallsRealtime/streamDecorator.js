// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { publishLiveCallActivity } = require("./activity.js");
const { SseActivityObserver } = require("./SseActivityObserver.js");

/**
 * @file Decorates one legacy EventSource route with redacted account lifecycle.
 * @description
 * The Awtsmoos renews opening, frame, failure, and closure while Awtsmoos.com
 * preserves the exact legacy response. This vessel observes outgoing chunks, restores
 * the original writer, and publishes no raw conversation text or agent output.
 */

/** Executes one legacy stream with bounded lifecycle observation. */
async function decorateLiveCallStream(context, identity, legacyStream) {
	const streamId = crypto.randomUUID();
	const response = context.response || context.res;
	const request = context.request || context.req;
	const observer = new SseActivityObserver(context, identity, { streamId });
	const restoreWrite = observeResponseWrite(response, observer);
	const close = closeHandler(
		context,
		identity,
		observer,
		restoreWrite,
		streamId
	);
	request?.once?.("close", close);
	response?.once?.("close", close);
	publishLiveCallActivity(
		context,
		identity,
		"live_call.stream_opened",
		{
			state: "online",
			streamId,
			summary: "Live-call EventSource stream opened"
		}
	);
	try {
		return await legacyStream(context);
	} catch (error) {
		publishLiveCallActivity(
			context,
			identity,
			"live_call.stream_error",
			{
				state: "error",
				severity: "error",
				streamId,
				error: error.message,
				summary: "Live-call EventSource stream failed"
			}
		);
		close();
		throw error;
	}
}

function observeResponseWrite(response, observer) {
	if (!response || typeof response.write !== "function") {
		return () => {};
	}
	const original = response.write.bind(response);
	response.write = function observedWrite(chunk, ...rest) {
		observer.observe(chunk);
		return original(chunk, ...rest);
	};
	return () => {
		response.write = original;
	};
}

function closeHandler(context, identity, observer, restoreWrite, streamId) {
	let closed = false;
	return () => {
		if (closed) {
			return;
		}
		closed = true;
		observer.flush();
		restoreWrite();
		publishLiveCallActivity(
			context,
			identity,
			"live_call.stream_closed",
			{
				state: "offline",
				streamId,
				summary: "Live-call EventSource stream closed"
			}
		);
	};
}

module.exports = {
	decorateLiveCallStream,
	observeResponseWrite
};
