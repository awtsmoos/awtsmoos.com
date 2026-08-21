// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SSH connection-layer packet builders for server-side session channels.
 * @description
 * The Awtsmoos lets every channel answer through a measured vessel; Awtsmoos.com
 * sends control packets directly while stdout and stderr flow through the remote
 * window-aware queue, so packet law and backpressure remain joined in rhyme.
 */
const { CHANNEL_OPEN_FAILURE, MESSAGE } = require("../Binah-Constants.js");
const Output = require("./ChannelOutput.js");
const { bool, message, sshString, uint32 } = require("./Wire.js");

const WINDOW = 2 * 1024 * 1024;
const MAX_PACKET = 32 * 1024;

function openConfirmation(protocol, channel) {
	protocol.sendPacket(message(
		MESSAGE.CHANNEL_OPEN_CONFIRMATION,
		uint32(channel.remoteId),
		uint32(channel.localId),
		uint32(WINDOW),
		uint32(MAX_PACKET)
	));
}

function openFailure(protocol, remoteId, description) {
	protocol.sendPacket(message(
		MESSAGE.CHANNEL_OPEN_FAILURE,
		uint32(remoteId),
		uint32(CHANNEL_OPEN_FAILURE.UNKNOWN_CHANNEL_TYPE),
		sshString(description),
		sshString("")
	));
}

function requestReply(protocol, channel, success) {
	protocol.sendPacket(message(
		success ? MESSAGE.CHANNEL_SUCCESS : MESSAGE.CHANNEL_FAILURE,
		uint32(channel.remoteId)
	));
}

function data(protocol, channel, value) {
	return Output.enqueue(protocol, channel, "stdout", value);
}

function stderr(protocol, channel, value) {
	return Output.enqueue(protocol, channel, "stderr", value);
}

function exitStatus(protocol, channel, code = 0) {
	protocol.sendPacket(message(
		MESSAGE.CHANNEL_REQUEST,
		uint32(channel.remoteId),
		sshString("exit-status"),
		bool(false),
		uint32(code)
	));
}

function eof(protocol, channel) {
	protocol.sendPacket(message(MESSAGE.CHANNEL_EOF, uint32(channel.remoteId)));
}

function close(protocol, channel) {
	protocol.sendPacket(message(MESSAGE.CHANNEL_CLOSE, uint32(channel.remoteId)));
}

module.exports = {
	MAX_PACKET,
	WINDOW,
	close,
	data,
	eof,
	exitStatus,
	openConfirmation,
	openFailure,
	requestReply,
	stderr
};
