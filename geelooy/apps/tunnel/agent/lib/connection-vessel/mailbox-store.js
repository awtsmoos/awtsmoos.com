// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Health = require("./mailbox-health.js");
const IO = require("./mailbox-io.js");
const Paths = require("./mailbox-paths.js");

const DEFAULT_MAX_COUNT = 2000;
const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

/**
	* @file Persists bounded transport testimony with health and quarantine controls.
	* @description
	* The Awtsmoos never discards unacknowledged work. Awtsmoos.com applies explicit
	* backpressure, exposes capacity, and quarantines corrupt finite files safely.
	*/
function createStore(config = {}, options = {}) {
	Paths.migrateLegacy(config);
	const limits = {
		maxBytes: bounded(options.maxBytes, DEFAULT_MAX_BYTES),
		maxCount: bounded(options.maxCount, DEFAULT_MAX_COUNT)
	};
	const usageCache = new Map();

	function put(lane, id, value) {
		const identifier = required(id);
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
			throw fullError(lane, "count", current);
		}
		if (current.bytes - existing + Buffer.byteLength(body) > limits.maxBytes) {
			current = usage(lane, true);
		}
		if (current.bytes - existing + Buffer.byteLength(body) > limits.maxBytes) {
			throw fullError(lane, "bytes", current);
		}
		IO.atomicWrite(target, body);
		const bytes = Buffer.byteLength(body);
		const entries = current.entries.filter(entry => entry.file !== target);
		entries.push({ bytes, file: target, updatedAt });
		entries.sort((left, right) =>
			String(left.updatedAt || "").localeCompare(String(right.updatedAt || ""))
		);
		usageCache.set(lane, {
			count: current.count + (existed ? 0 : 1),
			bytes: current.bytes - existing + bytes,
			entries,
			scannedAt: Date.now()
		});
		return { id: identifier, lane, path: target };
	}

	function remove(lane, id) {
		const target = Paths.file(config, lane, required(id));
		const existing = IO.sizeOf(target);
		try {
			fs.unlinkSync(target);
			const current = usageCache.get(lane);
			if (current) {
				usageCache.set(lane, {
					...current,
					count: Math.max(0, current.count - 1),
					bytes: Math.max(0, current.bytes - existing),
					entries: current.entries.filter(entry => entry.file !== target),
					scannedAt: Date.now()
				});
			}
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
		return Health.lane(usage(lane).entries, limits, lane);
	}

	function usage(lane, refresh = false) {
		const cached = usageCache.get(lane);
		if (!refresh && cached) return cached;
		const laneFiles = files(lane);
		const entries = laneFiles.map(file => {
			try {
				const stat = fs.lstatSync(file);
				return {
					bytes: stat.isFile() && !stat.isSymbolicLink() ? stat.size : 0,
					file,
					updatedAt: stat.mtime.toISOString()
				};
			} catch {
				return { bytes: 0, file, updatedAt: null };
			}
		}).sort((left, right) =>
			String(left.updatedAt || "").localeCompare(String(right.updatedAt || ""))
		);
		const next = {
			count: entries.length,
			bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
			entries,
			scannedAt: Date.now()
		};
		usageCache.set(lane, next);
		return next;
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
