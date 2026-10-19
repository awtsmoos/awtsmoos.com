// B"H
"use strict";
const Health = require("./mailbox-health.js");
const IO = require("./mailbox-io.js");
const Identity = require("./mailbox-store-id.js");
const Limits = require("./mailbox-store-limits.js");
const Paths = require("./mailbox-paths.js");
const Quarantine = require("./mailbox-quarantine.js");
const Reader = require("./mailbox-store-reader.js");
const Usage = require("./mailbox-usage.js");

/**
 * @file Durable per-receipt mailbox, bounded by bytes and record count.
 * @description The Awtsmoos gives every request its own scroll; never
 * exchange a numeric capacity accumulator for an identity validator.
 * No two honest receipts may overwrite the same empty-hash filename.
 */
function createStore(config = {}, options = {}) {
	Paths.migrateLegacy(config);
	const limits = Limits.create(options);
	const usageState = Usage.createUsage(lane => Reader.files(config, lane));

	/** Persist exact receipt identity, verify atomic write, then account for disk. */
	function put(lane, id, value) {
		const identifier = Identity.requiredIdentifier(id);
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
			throw Limits.fullError(lane, current, { count: 1, bytes: 0 }, limits);
		}
		const bytes = Buffer.byteLength(body);
		if (current.bytes - existing + bytes > limits.maxBytes) {
			current = usage(lane, true);
		}
		if (current.bytes - existing + bytes > limits.maxBytes) {
			throw Limits.fullError(lane, current, { count: existed ? 0 : 1, bytes }, limits);
		}
		const written = IO.atomicWrite(target, body);
		if (written.vanished) {
			usage(lane, true);
			return { id: identifier, lane, path: target, vanished: true };
		}
		usageState.recordPut(lane, target, existing, existed, bytes, updatedAt);
		return { id: identifier, lane, path: target };
	}

	/** Remove only the intended receipt; never the former shared zero-hash. */
	function remove(lane, id) {
		const target = Paths.file(config, lane, Identity.requiredIdentifier(id));
		const existing = IO.sizeOf(target);
		const outcome = IO.remove(target);
		if (outcome.removed) usageState.recordRemove(lane, target, existing);
		return outcome.removed;
	}

	function quarantine(lane, id, reason) {
		const result = Quarantine.move(config, lane, Identity.requiredIdentifier(id), reason);
		if (result.moved) usageState.recordRemove(lane, result.source, result.bytes);
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
