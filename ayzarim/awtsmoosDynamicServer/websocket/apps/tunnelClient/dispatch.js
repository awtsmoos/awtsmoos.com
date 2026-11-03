// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Session = require("./session.js");
const Upload = require("./upload.js");
const Limits = require("./constants.js");
const { collectTextMessage } = require("../../core/textFragments.js");

/**
 * @file Bounded FIFO preserves Awtsmoos.com raw frames and ordered receipts.
 * The Awtsmoos grants no endless heap and no premature ACK;
 * a slow consumer cannot silently pile the byte river back.
 */
function dispatch(server, client, frame) {
	if (client.externalOverflowed) return;
	if (!frame.masked) return failure(client, "CLIENT_FRAME_NOT_MASKED");
	if ((client.externalQueued || 0) >= Limits.MAX_QUEUED_FRAMES) {
		client.externalOverflowed = true;
		failure(client, "CLIENT_QUEUE_OVERFLOW");
		try { client.socket?.destroy?.(); } catch {}
		return;
	}
	let action;
	if (frame.opcode === 0x2 && frame.fin) {
		const bytes = frame.payload;
		action = () => {
			if (!client.externalHello) throw Error("CLIENT_HELLO_REQUIRED");
			return Upload.append(client, bytes);
		};
	} else if (frame.opcode === 0x1 || frame.opcode === 0x0) {
		if (frame.opcode === 0x0 && client.fragmentOpcode !== 0x1) {
			return failure(client, "INVALID_FRAME_FRAGMENT");
		}
		const text = collectTextMessage(client, frame);
		if (text === null) return;
		action = () => Session.handle(server, client, JSON.parse(text));
	} else {
		return failure(client, "INVALID_CLIENT_FRAME");
	}
	client.externalQueued = (client.externalQueued || 0) + 1;
	if (client.externalQueued >= Limits.MAX_QUEUED_FRAMES) client.socket?.pause?.();
	const prior = client.externalQueue || Promise.resolve();
	client.externalQueue = prior.catch(() => {}).then(action).catch(error => {
		failure(client, error.message);
	}).finally(() => {
		client.externalQueued -= 1;
		if (!client.externalOverflowed &&
			client.externalQueued <= Limits.WINDOW_CHUNKS) client.socket?.resume?.();
	});
}

/** Never echo bearer tokens, path resolutions or server stack traces. */
function failure(client, message) {
	const allowed = ["CLIENT_FRAME_NOT_MASKED", "CLIENT_HELLO_REQUIRED",
		"CLIENT_QUEUE_OVERFLOW", "INVALID_FRAME_FRAGMENT", "INVALID_CLIENT_FRAME",
		"INVALID_CLIENT_MESSAGE", "INVALID_CLIENT_HELLO", "BAD_CLIENT_MESSAGE_TYPE",
		"AUTH_REQUIRED", "SCOPE_DENIED", "ROUTE_NOT_OWNED",
		"INVALID_TRANSFER_MANIFEST", "TRANSFER_NOT_FOUND", "UPLOAD_NOT_STARTED",
		"INVALID_BINARY_CHUNK", "UPLOAD_SHA_MISMATCH", "DEVICE_SHA_MISMATCH",
		"DEVICE_OPERATION_FAILED", "DEVICE_RECEIPT_TIMEOUT", "DEVICE_OPERATION_DENIED",
		"CLIENT_STORAGE_QUOTA", "CLIENT_STORAGE_NOT_CONFIGURED", "CLIENT_STORAGE_PATH_UNSAFE",
		"INVALID_DOWNLOAD_OFFSET", "INVALID_SOURCE_PATH", "DEVICE_SOURCE_INVALID",
		"DEVICE_SOURCE_SHA_MISMATCH", "DOWNLOAD_SHA_MISMATCH", "CLIENT_DISCONNECTED",
		"CLIENT_BACKPRESSURE_TIMEOUT"];
	const code = allowed.includes(message) ? message : "CLIENT_TRANSFER_FAILED";
	try { client.send({ type: "CLIENT_ERROR", ok: false, code }); } catch {}
}

module.exports = { dispatch, failure };
