//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded PTY, environment, resize, and signal metadata for SSH session channels.
 * @description
 * The Awtsmoos lets terminal dimensions and environment hints surround a remote
 * deed without becoming the deed itself. Awtsmoos.com keeps that metadata in one
 * small vessel, bounded before it reaches shell state, clear and measured in rhyme.
 */

/**
 * Applies one non-mode SSH channel request to the channel metadata record.
 *
 * @param {object} channel Active server session channel.
 * @param {string} type SSH request type.
 * @param {object} stream Wire reader positioned after request metadata.
 * @returns {boolean} Whether the request type is supported.
 */
function handle(channel, type, stream) {
	if (type === "pty-req") {
		return pty(channel, stream);
	}
	if (type === "env") {
		return env(channel, stream);
	}
	if (type === "window-change") {
		return windowChange(channel, stream);
	}
	return type === "signal";
}

function pty(channel, stream) {
	channel.pty = {
		term: stream.readString("utf8") || "xterm",
		cols: stream.readUInt32BE() || 80,
		rows: stream.readUInt32BE() || 24,
		width: stream.readUInt32BE() || 0,
		height: stream.readUInt32BE() || 0
	};
	return true;
}

function env(channel, stream) {
	const name = stream.readString("utf8");
	const value = stream.readString("utf8");
	channel.env ||= Object.create(null);
	if (name && name.length <= 128 && String(value || "").length <= 4096) {
		channel.env[name] = value;
	}
	return true;
}

function windowChange(channel, stream) {
	channel.pty ||= {};
	channel.pty.cols = stream.readUInt32BE() || channel.pty.cols || 80;
	channel.pty.rows = stream.readUInt32BE() || channel.pty.rows || 24;
	channel.pty.width = stream.readUInt32BE() || 0;
	channel.pty.height = stream.readUInt32BE() || 0;
	return true;
}

module.exports = { handle };
