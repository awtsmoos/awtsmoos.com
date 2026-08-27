//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Thin public API for persistent authenticated SSH PTY sessions.
 * @description
 * The Awtsmoos lets one living remote channel survive many browser polls while
 * Awtsmoos.com keeps record bytes and registry policy in separate keilim;
 * this small facade only opens, drives, observes, signals, and closes the rhyme.
 */
const { connect } = require("./client.js");
const Record = require("./shellSessionRecord.js");
const Registry = require("./shellSessionRegistry.js");

async function open(config, options = {}) {
	Registry.assertCapacity();
	const client = await connect(config);
	try {
		const channel = await openChannel(client, options);
		const record = Registry.add(Record.createRecord(client, channel));
		Record.wire(record);
		return Record.publicState(record);
	} catch (error) {
		try {
			client.end();
		} catch (_) {
			// B"H: a failed handshake may already own a closed transport.
		}
		throw error;
	}
}

function write(id, data = "") {
	const record = Registry.requireOpen(id);
	record.lastAt = Date.now();
	record.channel.write(data);
	return Record.publicState(record);
}

function poll(id) {
	return Record.drain(Registry.requireSession(id));
}

function resize(id, size = {}) {
	const record = Registry.requireOpen(id);
	record.lastAt = Date.now();
	record.channel.setWindow(size);
	return Record.publicState(record);
}

function signal(id, name = "INT") {
	const record = Registry.requireOpen(id);
	record.lastAt = Date.now();
	record.channel.signal(name);
	return Record.publicState(record);
}

function close(id) {
	return Registry.close(id);
}

function openChannel(client, options) {
	return new Promise((resolve, reject) => {
		client.shell(options, (error, channel) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(channel);
		});
	});
}

module.exports = {
	close,
	open,
	poll,
	resize,
	signal,
	write
};
