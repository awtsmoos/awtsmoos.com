// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Remote-window-aware output queue for one SSH session channel.
 * @description
 * The Awtsmoos gives every byte a measured place inside the client's window;
 * Awtsmoos.com waits when the keli is full and resumes when WINDOW_ADJUST
 * expands it, so data never overflows the boundary while packet and stream rhyme.
 */
const { MESSAGE } = require("../Binah-Constants.js");
const { message, sshString, uint32 } = require("./Wire.js");

const FALLBACK_PACKET = 32 * 1024;

function enqueue(protocol, channel, kind, value) {
	const buffer = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "utf8");
	if (!buffer.length) {
		return Promise.resolve();
	}
	channel.outputQueue ||= [];
	return new Promise((resolve, reject) => {
		channel.outputQueue.push({ kind, buffer, offset: 0, resolve, reject });
		flush(protocol, channel);
	});
}

function adjust(protocol, channel, amount) {
	channel.remoteWindow = Math.max(
		0,
		Number(channel.remoteWindow || 0) + Number(amount || 0)
	);
	flush(protocol, channel);
}

function flush(protocol, channel) {
	const queue = channel.outputQueue || [];
	while (queue.length && channel.remoteWindow > 0 && !channel.closed) {
		const item = queue[0];
		const remaining = item.buffer.length - item.offset;
		const limit = Math.max(1, Number(channel.remotePacket || FALLBACK_PACKET));
		const length = Math.min(remaining, limit, channel.remoteWindow);
		const chunk = item.buffer.subarray(item.offset, item.offset + length);
		protocol.sendPacket(packetFor(channel, item.kind, chunk));
		item.offset += length;
		channel.remoteWindow -= length;
		if (item.offset >= item.buffer.length) {
			queue.shift();
			item.resolve();
		}
	}
}

function cancel(channel, reason = "ssh_channel_closed") {
	channel.closed = true;
	for (const item of channel.outputQueue || []) {
		item.reject(new Error(reason));
	}
	channel.outputQueue = [];
}

function packetFor(channel, kind, chunk) {
	if (kind === "stderr") {
		return message(
			MESSAGE.CHANNEL_EXTENDED_DATA,
			uint32(channel.remoteId),
			uint32(1),
			sshString(chunk)
		);
	}
	return message(
		MESSAGE.CHANNEL_DATA,
		uint32(channel.remoteId),
		sshString(chunk)
	);
}

module.exports = {
	adjust,
	cancel,
	enqueue,
	flush
};
