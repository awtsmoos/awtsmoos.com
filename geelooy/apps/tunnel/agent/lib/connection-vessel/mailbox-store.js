// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Health = require("./mailbox-health.js");
const IO = require("./mailbox-io.js");
const Limits = require("./mailbox-store-limits.js");
const Paths = require("./mailbox-paths.js");
const Quarantine = require("./mailbox-quarantine.js");
const Reader = require("./mailbox-store-reader.js");
const Usage = require("./mailbox-usage.js");

/**
 * @file Persists bounded mailbox testimony with exact semantic quarantine support.
 * @description
 * The Awtsmoos preserves every witness while active custody may change. Awtsmoos.com
 * keeps hot writes small, moves stale exact evidence instead of deleting it, and delegates
 * reading and limit policy to sibling vessels so emergency storage stays auditable.
 */
function createStore(config = {}, options = {}) {
	Paths.migrateLegacy(config);
	const limits = Limits.create(options);
	const usageState = Usage.createUsage(lane => Reader.files(config, lane));

	function put(lane, id, value) {
		const identifier = Limits.required(id);
		const target = Paths.file(config, lane, identifier);
		const updatedAt = new Date().toISOString();
		const body = `${JSON.stringify({ id: identifier, updatedAt, value }, null, 2)}\n`;
		const existing = IO.sizeOf(target);
		const existed = existing > 0;
		let current = usage(lane);
		if (!existed && current.count >= limits.maxCount) {
			current = usage(lane, true);
		}
		if (!existed && current.count >= limits.maxCount) {
			throw Limits.fullError(lane, "count", current);
		}
		const bytes = Buffer.byteLength(body);
		if (current.bytes - existing + bytes > limits.maxBytes) {
			current = usage(lane, true);
		}
		if (current.bytes - existing + bytes > limits.maxBytes) {
			throw Limits.fullError(lane, "bytes", current);
		}
		IO.atomicWrite(target, body);
		usageState.recordPut(lane, target, existing, existed, bytes, updatedAt);
		return { id: identifier, lane, path: target };
	}

	function remove(lane, id) {
		const target = Paths.file(config, lane, Limits.required(id));
		const existing = IO.sizeOf(target);
		try {
			fs.unlinkSync(target);
			usageState.recordRemove(lane, target, existing);
			return true;
		} catch (error) {
			if (error.code === "ENOENT") {
				return false;
			}
			throw error;
		}
	}

	function quarantine(lane, id, reason) {
		const result = Quarantine.move(config, lane, id, reason);
		if (result.moved) {
			usageState.recordRemove(lane, result.source, result.bytes);
		}
		return result;
	}

	function snapshot(lane) {
		return Health.lane(usage(lane, true).entries, limits, lane);
	}

	function usage(lane, refresh = false) {
		return usageState.read(lane, refresh);
	}

	function quarantineInvalid(lane) {
		const moved = Reader.quarantineInvalid(config, lane);
		usage(lane, true);
		return moved;
	}

	return {
		get: (lane, id) => Reader.get(config, lane, id),
		limits,
		list: lane => Reader.list(config, lane),
		put,
		quarantine,
		quarantineInvalid,
		remove,
		snapshot,
		usage
	};
}

module.exports = {
	DEFAULT_MAX_BYTES: Limits.DEFAULT_MAX_BYTES,
	DEFAULT_MAX_COUNT: Limits.DEFAULT_MAX_COUNT,
	createStore
};
