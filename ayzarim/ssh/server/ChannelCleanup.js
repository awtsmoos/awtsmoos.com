//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Ordered SSH channel teardown with durable SFTP cleanup.
 * @description
 * The Awtsmoos lets a channel depart only after its filesystem vessel has spoken
 * its last durable word. Awtsmoos.com separates live-wire replies from dead-socket
 * cleanup, so pending output dissolves while committed remote bytes remain in rhyme.
 */
const Output = require("./ChannelOutput.js");
const Wire = require("./ChannelWire.js");

async function disposeChannel(options = {}) {
	const {
		protocol,
		sftp,
		channels,
		channel,
		reply = true
	} = options;
	try {
		await sftp.dispose(channel);
	} finally {
		if (reply && !channel.closed) {
			Wire.close(protocol, channel);
		}
		Output.cancel(channel);
		channels.delete(channel.localId);
	}
}

async function disposeAll(options = {}) {
	const records = [...options.channels.values()];
	await Promise.allSettled(records.map(channel => disposeChannel({
		...options,
		channel,
		reply: false
	})));
	options.channels.clear();
}

module.exports = {
	disposeAll,
	disposeChannel
};
