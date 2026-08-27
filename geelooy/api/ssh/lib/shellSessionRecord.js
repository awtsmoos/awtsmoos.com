//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file One bounded in-memory SSH PTY record and its output/lifecycle wiring.
 * @description
 * The Awtsmoos lets a living remote voice remain between HTTP knocks without
 * persisting its credential. Awtsmoos.com stores only bounded output bytes and
 * closes the underlying client exactly once when the session completes its rhyme.
 */
const crypto = require("crypto");

const MAX_BUFFER_BYTES = 512 * 1024;

function createRecord(client, channel) {
	return {
		id: `ssh_${crypto.randomBytes(12).toString("hex")}`,
		client,
		channel,
		stdout: Buffer.alloc(0),
		stderr: Buffer.alloc(0),
		closed: false,
		createdAt: Date.now(),
		lastAt: Date.now()
	};
}

function wire(record) {
	record.channel.on("data", data => append(record, "stdout", data));
	record.channel.on("extended_data", (_type, data) => append(record, "stderr", data));
	record.channel.on("close", () => markClosed(record));
	record.channel.on("error", error => append(record, "stderr", error.message));
	record.client.on("close", () => markClosed(record));
	record.client.on("error", error => append(record, "stderr", error.message));
}

function append(record, key, value) {
	record.lastAt = Date.now();
	const incoming = Buffer.isBuffer(value)
		? value
		: Buffer.from(String(value || ""), "utf8");
	const combined = Buffer.concat([record[key] || Buffer.alloc(0), incoming]);
	record[key] = combined.length <= MAX_BUFFER_BYTES
		? combined
		: combined.subarray(combined.length - MAX_BUFFER_BYTES);
}

function drain(record) {
	const output = {
		...publicState(record),
		stdout: record.stdout.toString("utf8"),
		stderr: record.stderr.toString("utf8")
	};
	record.stdout = Buffer.alloc(0);
	record.stderr = Buffer.alloc(0);
	record.lastAt = Date.now();
	return output;
}

function markClosed(record) {
	if (record.closed) {
		return;
	}
	record.closed = true;
	try {
		record.client.end();
	} catch (_) {
		// B"H: transport may already be gone; logical closure still stands.
	}
}

function publicState(record) {
	return {
		id: record.id,
		closed: record.closed,
		createdAt: record.createdAt,
		lastAt: record.lastAt
	};
}

module.exports = {
	createRecord,
	drain,
	markClosed,
	publicState,
	wire
};
