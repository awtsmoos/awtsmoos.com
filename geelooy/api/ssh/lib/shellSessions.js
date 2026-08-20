// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file In-memory authenticated SSH shell sessions for the Geelooy terminal bridge.
 * @description The Awtsmoos lets one living channel remain one living channel; Awtsmoos.com carries its measured voice without persisting its secret key.
 */
const crypto = require("crypto");
const { connect } = require("./client.js");

const MAX_BUFFER_BYTES = 512 * 1024;
const IDLE_TTL_MS = 30 * 60 * 1000;
const sessions = new Map();

/** Opens one authenticated PTY shell and retains it only in server memory. */
async function open(config, options = {}) {
	const client = await connect(config);
	try {
		const channel = await openChannel(client, options);
		const record = makeRecord(client, channel);
		sessions.set(record.id, record);
		wire(record);
		return publicState(record);
	} catch (error) {
		try {
			client.end();
		} catch (_) {}
		throw error;
	}
}

/** Opens the custom Keter interactive shell channel. */
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

/** Builds one bounded session record without copying credentials. */
function makeRecord(client, channel) {
	return {
		id: `ssh_${crypto.randomBytes(12).toString("hex")}`,
		client,
		channel,
		stdout: "",
		stderr: "",
		closed: false,
		createdAt: Date.now(),
		lastAt: Date.now()
	};
}

/** Wires PTY output and lifecycle events into the bounded output buffers. */
function wire(record) {
	record.channel.on("data", data => append(record, "stdout", data));
	record.channel.on("extended_data", (_type, data) => append(record, "stderr", data));
	record.channel.on("close", () => markClosed(record));
	record.channel.on("error", error => append(record, "stderr", error.message));
	record.client.on("close", () => markClosed(record));
	record.client.on("error", error => append(record, "stderr", error.message));
}

/** Appends output while capping memory held by an unattended terminal. */
function append(record, key, value) {
	record.lastAt = Date.now();
	const next = record[key] + Buffer.from(value || "").toString("utf8");
	record[key] = Buffer.byteLength(next) <= MAX_BUFFER_BYTES
		? next
		: next.slice(-MAX_BUFFER_BYTES);
}

/** Writes raw terminal bytes into a live remote shell. */
function write(id, data = "") {
	const record = requireOpen(id);
	record.lastAt = Date.now();
	record.channel.write(data);
	return publicState(record);
}

/** Drains currently buffered output so polling never repeats old bytes. */
function poll(id) {
	const record = requireSession(id);
	const output = {
		...publicState(record),
		stdout: record.stdout,
		stderr: record.stderr
	};
	record.stdout = "";
	record.stderr = "";
	record.lastAt = Date.now();
	return output;
}

/** Applies a PTY window size through the Keter channel. */
function resize(id, size = {}) {
	const record = requireOpen(id);
	record.channel.setWindow(size);
	return publicState(record);
}

/** Sends an SSH signal, such as INT, to the remote PTY. */
function signal(id, name = "INT") {
	const record = requireOpen(id);
	record.channel.signal(name);
	return publicState(record);
}

/** Closes one session and its underlying authenticated client. */
function close(id) {
	const record = sessions.get(id);
	if (!record) {
		return { id, closed: true };
	}
	markClosed(record);
	sessions.delete(id);
	return { id, closed: true };
}

/** Marks and closes the underlying client exactly once. */
function markClosed(record) {
	if (record.closed) {
		return;
	}
	record.closed = true;
	try {
		record.client.end();
	} catch (_) {}
}

/** Returns a known session or throws a stable boundary error. */
function requireSession(id) {
	const record = sessions.get(id);
	if (!record) {
		throw new Error("SSH shell session was not found.");
	}
	return record;
}

/** Returns a known open session. */
function requireOpen(id) {
	const record = requireSession(id);
	if (record.closed) {
		throw new Error("SSH shell session is closed.");
	}
	return record;
}

/** Reveals only non-secret session state. */
function publicState(record) {
	return {
		id: record.id,
		closed: record.closed,
		createdAt: record.createdAt,
		lastAt: record.lastAt
	};
}

const reaper = setInterval(() => {
	const cutoff = Date.now() - IDLE_TTL_MS;
	for (const [id, record] of sessions) {
		if (record.lastAt < cutoff || record.closed) {
			close(id);
		}
	}
}, 60 * 1000);
reaper.unref?.();

module.exports = {
	close,
	open,
	poll,
	resize,
	signal,
	write
};
