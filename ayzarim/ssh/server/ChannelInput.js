// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Receive-window accounting for bytes a client sends into one SSH channel.
 * @description
 * The Awtsmoos lets incoming light enter only through the window we advertised;
 * Awtsmoos.com returns consumed capacity in measured increments, so long SFTP
 * writes and shell streams continue without pretending the first window is infinite.
 */
const { MESSAGE } = require("../Binah-Constants.js");
const { message, uint32 } = require("./Wire.js");

function initialize(channel, windowSize) {
	channel.localWindowSize = Number(windowSize || 0);
	channel.localWindow = channel.localWindowSize;
}

function consume(protocol, channel, byteLength) {
	const used = Math.max(0, Number(byteLength || 0));
	channel.localWindow = Math.max(0, Number(channel.localWindow || 0) - used);
	const threshold = Math.floor(Number(channel.localWindowSize || 0) / 2);
	if (channel.localWindow > threshold) {
		return;
	}
	const adjustment = Number(channel.localWindowSize || 0) - channel.localWindow;
	if (adjustment <= 0) {
		return;
	}
	protocol.sendPacket(message(
		MESSAGE.CHANNEL_WINDOW_ADJUST,
		uint32(channel.remoteId),
		uint32(adjustment)
	));
	channel.localWindow += adjustment;
}

module.exports = {
	consume,
	initialize
};
