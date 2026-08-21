//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Fake interactive shell and exec behavior with capability-aware admission.
 * @description
 * The Awtsmoos lets a real terminal enter one bounded fake shell while text
 * normalization lives in its own vessel. Awtsmoos.com asks permission before
 * channel success, preserves measured command flow, and never invokes the host in rhyme.
 */
const Text = require("./ShellText.js");
const Wire = require("./ChannelWire.js");

const MAX_LINE_CHARS = 32 * 1024;

class ServerShell {
	constructor(protocol, backend) {
		this.protocol = protocol;
		this.backend = backend;
	}

	canStart(channel) {
		return this.backend.canShell?.(channel.session) !== false;
	}

	async start(channel) {
		channel.mode = "shell";
		channel.lineBuffer = "";
		const welcome = await this.backend.welcome?.(channel.session);
		if (welcome) {
			await Wire.data(this.protocol, channel, Text.ensureNewline(welcome));
		}
		await this.prompt(channel);
	}

	async exec(channel, command) {
		channel.mode = "exec";
		const result = await this.run(channel, command);
		await this.emitResult(channel, result);
		Wire.exitStatus(this.protocol, channel, result.code || 0);
		Wire.eof(this.protocol, channel);
		Wire.close(this.protocol, channel);
		channel.closed = true;
	}

	async data(channel, incoming) {
		if (channel.mode !== "shell") {
			return;
		}
		const text = Buffer.from(incoming).toString("utf8");
		if (text.includes("\u0003")) {
			channel.lineBuffer = "";
			await Wire.data(this.protocol, channel, "^C\r\n");
			await this.prompt(channel);
			return;
		}
		channel.lineBuffer += Text.normalizeLineEndings(text);
		if (channel.lineBuffer.length > MAX_LINE_CHARS) {
			channel.lineBuffer = "";
			await Wire.stderr(this.protocol, channel, "command line too long\r\n");
			await this.prompt(channel);
			return;
		}
		await this.drainLines(channel);
	}

	async drainLines(channel) {
		while (channel.lineBuffer.includes("\n")) {
			const index = channel.lineBuffer.indexOf("\n");
			const line = channel.lineBuffer.slice(0, index);
			channel.lineBuffer = channel.lineBuffer.slice(index + 1);
			const result = await this.run(channel, line);
			await this.emitResult(channel, result);
			await this.prompt(channel);
		}
	}

	async run(channel, line) {
		try {
			return await this.backend.run(channel.session, String(line || ""));
		} catch (error) {
			return {
				ok: false,
				stdout: "",
				stderr: error?.message || String(error),
				code: 1
			};
		}
	}

	async emitResult(channel, result = {}) {
		if (result.stdout) {
			await Wire.data(
				this.protocol,
				channel,
				Text.ensureNewline(result.stdout)
			);
		}
		if (result.stderr) {
			await Wire.stderr(
				this.protocol,
				channel,
				Text.ensureNewline(result.stderr)
			);
		}
	}

	prompt(channel) {
		const value = this.backend.prompt?.(channel.session) || "awtsmoos$ ";
		return Wire.data(this.protocol, channel, value);
	}
}

module.exports = { ServerShell };
