//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Capability-aware SSH channel-request admission for shell, exec, SFTP, and metadata.
 * @description
 * The Awtsmoos lets each requested mode approach its channel as a distinct keli;
 * Awtsmoos.com asks permission before announcing success, so a forbidden shell or
 * subsystem never receives a false welcome while bounded metadata keeps its rhyme.
 */
const Metadata = require("./ChannelMetadata.js");
const Wire = require("./ChannelWire.js");
const { reader } = require("./Wire.js");

class ChannelRequests {
	constructor(protocol, shell, sftp) {
		this.protocol = protocol;
		this.shell = shell;
		this.sftp = sftp;
	}

	/**
	 * Routes one channel request and answers only after admission is known.
	 *
	 * @param {object} channel Active authenticated session channel.
	 * @param {Buffer} payload SSH CHANNEL_REQUEST payload.
	 * @returns {Promise<boolean>|boolean} Whether the request was accepted.
	 */
	async handle(channel, payload) {
		const stream = reader(payload);
		stream.readUInt32BE();
		const type = stream.readString("ascii");
		const wantReply = stream.readBool();
		if (type === "shell") {
			return this.startShell(channel, wantReply);
		}
		if (type === "exec") {
			const command = stream.readString("utf8") || "";
			return this.startExec(channel, wantReply, command);
		}
		if (type === "subsystem") {
			return this.startSubsystem(
				channel,
				wantReply,
				stream.readString("ascii")
			);
		}
		const accepted = Metadata.handle(channel, type, stream);
		this.reply(channel, wantReply, accepted);
		return accepted;
	}

	startShell(channel, wantReply) {
		return this.startMode(
			channel,
			wantReply,
			"shell",
			() => this.shell.canStart(channel),
			() => this.shell.start(channel)
		);
	}

	startExec(channel, wantReply, command) {
		return this.startMode(
			channel,
			wantReply,
			"exec",
			() => this.shell.canStart(channel),
			() => this.shell.exec(channel, command)
		);
	}

	async startMode(channel, wantReply, mode, admit, task) {
		if (channel.mode || !await admit()) {
			this.reply(channel, wantReply, false);
			return false;
		}
		channel.mode = mode;
		this.reply(channel, wantReply, true);
		await task();
		return true;
	}

	startSubsystem(channel, wantReply, subsystem) {
		const accepted = !channel.mode &&
			subsystem === "sftp" &&
			this.sftp.canStart(channel);
		if (!accepted) {
			this.reply(channel, wantReply, false);
			return false;
		}
		channel.mode = "sftp";
		this.reply(channel, wantReply, true);
		this.sftp.start(channel);
		return true;
	}

	reply(channel, wantReply, accepted) {
		if (wantReply) {
			Wire.requestReply(this.protocol, channel, Boolean(accepted));
		}
	}
}

module.exports = { ChannelRequests };
