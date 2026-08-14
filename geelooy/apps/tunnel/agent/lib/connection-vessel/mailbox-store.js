// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Health = require("./mailbox-health.js");
const IO = require("./mailbox-io.js");
const Paths = require("./mailbox-paths.js");
const Usage = require("./mailbox-usage.js");

const DEFAULT_MAX_COUNT = 2000;
const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

/**
 * @file Persists bounded transport testimony and reports disk-truthful health.
 * @description
 * The child may settle a witness while the parent still remembers it. Awtsmoos.com
 * therefore lets health reread durable reality, while local writes keep a fast cache.
 */
function createStore(config = {}, options = {}) {
	Paths.migrateLegacy(config);
	const limits = {
		maxBytes: bounded(options.maxBytes, DEFAULT_MAX_BYTES),
		maxCount: bounded(options.maxCount, DEFAULT_MAX_COUNT)
	};
	const usageState = Usage.createUsage(files);
	function put(lane, id, value) {
		const identifier = required(id);
		const target = Paths.file(config, lane, identifier);
		const updatedAt = new Date().toISOString();
		const body = `${JSON.stringify({ id: identifier, updatedAt, value }, null, 2)}\n`;
		const existing = IO.sizeOf(target);
		const existed = existing > 0;
		let current = usage(lane);
		if (!existed && current.count >= limits.maxCount) current = usage(lane, true);
		if (!existed && current.count >= limits.maxCount) throw fullError(lane, "count", current);
		const bytes = Buffer.byteLength(body);
		if (current.bytes - existing + bytes > limits.maxBytes) current = usage(lane, true);
		if (current.bytes - existing + bytes > limits.maxBytes) throw fullError(lane, "bytes", current);
		IO.atomicWrite(target, body);
		usageState.recordPut(lane, target, existing, existed, bytes, updatedAt);
		return { id: identifier, lane, path: target };
	}
	function remove(lane, id) {
		const target = Paths.file(config, lane, required(id));
		const existing = IO.sizeOf(target);
		try {
			fs.unlinkSync(target);
			usageState.recordRemove(lane, target, existing);
			return true;
		} catch (error) {
			if (error.code === "ENOENT") return false;
			throw error;
		}
	}
	function list(lane) {
		return files(lane)
			.map(file => IO.read(file))
			.filter(Boolean)
			.sort((left, right) => String(left.updatedAt).localeCompare(String(right.updatedAt)));
	}
	function get(lane, id) {
		return IO.read(Paths.file(config, lane, required(id)));
	}
	function snapshot(lane) {
		return Health.lane(usage(lane, true).entries, limits, lane);
	}
	function usage(lane, refresh = false) {
		return usageState.read(lane, refresh);
	}
	function quarantineInvalid(lane) {
		const moved = [];
		const destination = path.join(Paths.root(config), "quarantine", lane);
		for (const file of files(lane)) {
			if (IO.read(file)) continue;
			fs.mkdirSync(destination, { recursive: true });
			const target = path.join(destination, `${Date.now()}-${path.basename(file)}`);
			fs.renameSync(file, target);
			moved.push(target);
		}
		return moved;
	}
	function files(lane) {
		const directory = Paths.lane(config, lane);
		try {
			return fs.readdirSync(directory)
				.filter(name => name.endsWith(".json"))
				.map(name => path.join(directory, name));
		} catch (error) {
			if (error.code === "ENOENT") return [];
			throw error;
		}
	}

	return { get, limits, list, put, quarantineInvalid, remove, snapshot, usage };
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
	error.healthImpact = "transport_backpressure";
	error.nextActions = state.nextActions;
	return error;
}
module.exports = { DEFAULT_MAX_BYTES, DEFAULT_MAX_COUNT, createStore };
