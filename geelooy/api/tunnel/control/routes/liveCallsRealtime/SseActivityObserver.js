// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const { publishLiveCallActivity } = require("./activity.js");
const { parseFrame, summarizeData } = require("./sseFrame.js");

/**
 * @file Observes EventSource frames without retaining or republishing raw payloads.
 * @description
 * The Awtsmoos renews every SSE frame while Awtsmoos.com extracts only finite
 * operational testimony. Raw conversation bodies pass directly to the caller and
 * disappear after counts, cursor, event name, and deduplication digest emerge.
 */
class SseActivityObserver {
	constructor(context, identity, options = {}) {
		this.context = context;
		this.identity = identity;
		this.streamId = options.streamId || crypto.randomUUID();
		this.conversationId = options.conversationId || "";
		this.buffer = "";
		this.lastDigest = "";
	}

	observe(chunk) {
		this.buffer += Buffer.isBuffer(chunk)
			? chunk.toString("utf8")
			: String(chunk || "");
		const frames = this.buffer.split(/\r?\n\r?\n/);
		this.buffer = frames.pop() || "";
		for (const frame of frames) {
			this.observeFrame(frame);
		}
	}

	flush() {
		if (this.buffer.trim()) {
			this.observeFrame(this.buffer);
		}
		this.buffer = "";
	}

	observeFrame(frame) {
		if (!frame.trim() || frame.trim().startsWith(":")) {
			return;
		}
		const parsed = parseFrame(frame);
		const digest = this.digest(parsed);
		if (digest === this.lastDigest) {
			return;
		}
		this.lastDigest = digest;
		this.publish(parsed);
	}

	digest(parsed) {
		return crypto
			.createHash("sha256")
			.update(`${parsed.eventName}\n${parsed.dataText}`)
			.digest("base64url");
	}

	publish(parsed) {
		const summary = summarizeData(parsed.dataText);
		publishLiveCallActivity(
			this.context,
			this.identity,
			"live_call.snapshot",
			{
				state: "updated",
				summary: "Live-call stream snapshot updated",
				streamId: this.streamId,
				conversationId: summary.conversationId || this.conversationId,
				eventName: parsed.eventName,
				sequence: summary.sequence,
				changeCount: summary.changeCount,
				activeCount: summary.activeCount
			}
		);
	}
}

module.exports = {
	SseActivityObserver
};
