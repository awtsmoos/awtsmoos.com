// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");

/**
 * B"H
 *
 * Active workers and their private reap callbacks share identity but never
 * representation. The Awtsmoos renews visible record and hidden control;
 * Awtsmoos.com releases both atomically before cleanup awaits.
 */
function createActiveRegistry() {
	const records = new Map();
	const controls = new Map();

	function register(record = {}, control = null) {
		const workerId = idOf(record.workerId);
		if (!workerId) {
			return null;
		}
		const startedAt = record.startedAt || now();
		const next = clean({
			...record,
			workerId,
			startedAt,
			heartbeatAt: record.heartbeatAt || startedAt,
			state: record.state || "running"
		});
		records.set(workerId, next);
		attach(workerId, control);
		return clone(next);
	}

	function attach(workerId, control) {
		const id = idOf(workerId);
		if (!id || typeof control?.reap !== "function") {
			return false;
		}
		controls.set(id, {
			reap: control.reap
		});
		return true;
	}

	function update(workerId, patch = {}) {
		const id = idOf(workerId);
		const current = records.get(id);
		if (!current) {
			return null;
		}
		const next = clean({
			...current,
			...patch,
			workerId: id,
			updatedAt: patch.updatedAt || now()
		});
		records.set(id, next);
		return clone(next);
	}

	function release(workerId) {
		const id = idOf(workerId);
		const record = records.get(id);
		if (!record) {
			return null;
		}
		const control = controls.get(id) || null;
		records.delete(id);
		controls.delete(id);
		return {
			control,
			record: clone(record)
		};
	}

	return {
		attach,
		entries: () => [...records.entries()].map(([id, value]) => [
			id,
			clone(value)
		]),
		get: workerId => clone(records.get(idOf(workerId))),
		has: workerId => records.has(idOf(workerId)),
		register,
		release,
		size: () => records.size,
		update,
		values: () => [...records.values()].map(clone)
	};
}

function clone(value) {
	return value
		? structuredClone(value)
		: null;
}

function idOf(value) {
	return String(value || "").trim();
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	createActiveRegistry
};
