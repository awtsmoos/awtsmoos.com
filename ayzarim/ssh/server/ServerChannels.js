//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Narrow server-side SSH channel coordinator over registry, flow, shell, and SFTP vessels.
 * @description
 * The Awtsmoos lets one authenticated connection reveal many session channels,
 * while Awtsmoos.com keeps identity in a registry and flow in dedicated helpers.
 * The coordinator only joins those vessels, so each remote deed stays clear in rhyme.
 */
const { MESSAGE } = require("../Binah-Constants.js");
const Cleanup = require("./ChannelCleanup.js");
const Input = require("./ChannelInput.js");
const Output = require("./ChannelOutput.js");
const { ChannelRequests } = require("./ChannelRequests.js");
const { ServerChannelRegistry } = require("./ServerChannelRegistry.js");
const { ServerSftp } = require("./ServerSftp.js");
const { ServerShell } = require("./ServerShell.js");
const Wire = require("./ChannelWire.js");
const { reader } = require("./Wire.js");

class ServerChannels {
	constructor(protocol, backend) {
		this.protocol = protocol;
		this.backend = backend;
		this.registry = new ServerChannelRegistry();
		this.shell = new ServerShell(protocol, backend);
		this.sftp = new ServerSftp(protocol, backend);
		this.requests = new ChannelRequests(protocol, this.shell, this.sftp);
	}

	handle(payload) {
		const type = payload[0];
		if (type === MESSAGE.CHANNEL_OPEN) return this.open(payload);
		if (type === MESSAGE.CHANNEL_REQUEST) return this.request(payload);
		if (type === MESSAGE.CHANNEL_DATA) return this.data(payload);
		if (type === MESSAGE.CHANNEL_WINDOW_ADJUST) return this.adjust(payload);
		if (type === MESSAGE.CHANNEL_EOF) return this.eof(payload);
		if (type === MESSAGE.CHANNEL_CLOSE) return this.close(payload);
		throw new Error(`Unsupported SSH connection message: ${type}`);
	}

	async open(payload) {
		const stream = reader(payload);
		const channelType = stream.readString("ascii");
		const remoteId = stream.readUInt32BE();
		const remoteWindow = stream.readUInt32BE();
		const remotePacket = stream.readUInt32BE();
		if (channelType !== "session") {
			return Wire.openFailure(
				this.protocol,
				remoteId,
				`Unsupported channel type: ${channelType}`
			);
		}
		const channel = this.registry.create({
			remoteId,
			remoteWindow,
			remotePacket,
			session: await this.backend.createSession(this.protocol.auth)
		});
		Input.initialize(channel, Wire.WINDOW);
		Wire.openConfirmation(this.protocol, channel);
	}

	request(payload) {
		return this.requests.handle(this.channelFrom(payload), payload);
	}

	async data(payload) {
		const stream = reader(payload);
		const channel = this.registry.require(stream.readUInt32BE());
		const incoming = stream.readString(null) || Buffer.alloc(0);
		if (channel.mode === "sftp") {
			await this.sftp.feed(channel, incoming);
		} else {
			await this.shell.data(channel, incoming);
		}
		Input.consume(this.protocol, channel, incoming.length);
	}

	adjust(payload) {
		const stream = reader(payload);
		const channel = this.registry.require(stream.readUInt32BE());
		Output.adjust(this.protocol, channel, stream.readUInt32BE() || 0);
	}

	eof(payload) {
		this.channelFrom(payload).eof = true;
	}

	close(payload) {
		return Cleanup.disposeChannel({
			protocol: this.protocol,
			sftp: this.sftp,
			channels: this.registry.channels,
			channel: this.channelFrom(payload),
			reply: true
		});
	}

	closeAll() {
		return Cleanup.disposeAll({
			protocol: this.protocol,
			sftp: this.sftp,
			channels: this.registry.channels
		});
	}

	channelFrom(payload) {
		return this.registry.require(reader(payload).readUInt32BE());
	}
}

module.exports = { ServerChannels };
