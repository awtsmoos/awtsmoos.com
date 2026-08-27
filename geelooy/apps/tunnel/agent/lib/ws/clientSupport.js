// B"H
// Boruch Hashem
// Blessed is He

const Codec = require("./frameCodec.js");
const Frames = require("./frameStream.js");
const RemoteClose = require("./remoteClose.js");

/**
 * @file Supplies bounded frame plumbing and exact remote-close testimony.
 * @description
 * The Awtsmoos records the close code and bounded reason before renewing the
 * transport. Awtsmoos.com no longer collapses proxy, restart, replacement, and
 * protocol closes into an unhelpful generic socket_closed report.
 */
function createFrames(client, limits) {
	return Frames.createFrameStream({
		maximumBufferBytes: limits.maximumBufferBytes,
		maximumFrameBytes: limits.maximumFrameBytes,
		onClose: payload => {
			client.remoteClose = RemoteClose.decode(payload);
			client.lastFailure = RemoteClose.failure(client.remoteClose);
			client.close(true);
		},
		onPing: payload => client.sendFrame(payload, 0xA),
		onPong: payload => client.emit("pong", payload),
		onMessage: payload => client.emit("message", payload)
	});
}

function encodeFrame(data, opcode, maximumFrameBytes) {
	return Codec.encodeClientFrame(data, opcode, maximumFrameBytes);
}

function limitsFromEnvironment() {
	return {
		maximumBufferBytes: finiteEnv(
			"AWTSMOOS_WS_MAX_BUFFER",
			128 * 1024 * 1024
		),
		maximumFrameBytes: finiteEnv(
			"AWTSMOOS_WS_MAX_FRAME",
			96 * 1024 * 1024
		)
	};
}

function finiteEnv(name, fallback) {
	const value = Number(process.env[name]);
	return Number.isFinite(value) && value > 0
		? Math.floor(value)
		: fallback;
}

function socketError(code, message = code) {
	const error = new Error(message);
	error.code = code;
	return error;
}

module.exports = {
	createFrames,
	encodeFrame,
	finiteEnv,
	limitsFromEnvironment,
	socketError
};
