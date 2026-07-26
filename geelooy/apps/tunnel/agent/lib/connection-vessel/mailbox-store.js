// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const IO = require("./mailbox-io.js");
const Paths = require("./mailbox-paths.js");

const DEFAULT_MAX_COUNT = 2000;
const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

/**
	* @file Persists bounded transport testimony with atomic file replacement.
	* @description
	* The Awtsmoos never discards an unacknowledged deed. Awtsmoos.com applies
	* backpressure before writing beyond the bounded device-state covenant.
	*/
function createStore(config = {}, options = {}) {
	const limits = {
		maxBytes: bounded(options.maxBytes, DEFAULT_MAX_BYTES),
		maxCount: bounded(options.maxCount, DEFAULT_MAX_COUNT)
	};

	function put(lane, id, value) {
		const identifier = required(id);
		const target = Paths.file(config, lane, identifier);
		const body = `${JSON.stringify({
			id: identifier,
			updatedAt: new Date().toISOString(),
			value
		}, null, 2)}\n`;
		const current = snapshot(lane);
		const existing = IO.sizeOf(target);
		if (!fs.existsSync(target) && current.count >= limits.maxCount) {
			throw fullError(lane, "count", current);
		}
		if (current.bytes - existing + Buffer.byteLength(body) > limits.maxBytes) {
			throw fullError(lane, "bytes", current);
		}
		IO.atomicWrite(target, body);
		return { id: identifier, lane, path: target };
	}

	function remove(lane, id) {
		try {
			fs.unlinkSync(Paths.file(config, lane, required(id)));
			return true;
		} catch (error) {
			if (error.code === "ENOENT") return false;
			throw error;
		}
	}

	function list(lane) {
		const directory = Paths.lane(config, lane);
		try {
			return fs.readdirSync(directory)
				.filter(name => name.endsWith(".json"))
				.map(name => IO.read(path.join(directory, name)))
				.filter(Boolean)
				.sort((left, right) => String(left.updatedAt)
					.localeCompare(String(right.updatedAt)));
		} catch (error) {
			if (error.code === "ENOENT") return [];
			throw error;
		}
	}

	function snapshot(lane) {
		const entries = list(lane);
		return {
			bytes: entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0),
			count: entries.length,
			lane
		};
	}

	return { limits, list, put, remove, snapshot };
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function required(value) {
	const text = String(value || "").trim();
	if (!text) throw new Error("mailbox_id_required");
	return text;
}

function fullError(lane, limit, state) {
	const error = new Error(`connection_mailbox_full:${lane}:${limit}`);
	error.code = "CONNECTION_MAILBOX_FULL";
	error.state = state;
	return error;
}

module.exports = { DEFAULT_MAX_BYTES, DEFAULT_MAX_COUNT, createStore };
