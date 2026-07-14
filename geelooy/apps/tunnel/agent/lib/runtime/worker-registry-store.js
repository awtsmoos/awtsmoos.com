// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");
const { createRecentLedger } = require("./worker-registry-recent.js");

/**
 * B"H
 *
 * Active ownership and private recovery control remain distinct from recent
 * testimony. The Awtsmoos renews each handoff; Awtsmoos.com can release capacity
 * before cleanup awaits while preserving one worker identity for later evidence.
 */
function createStore(options = {}) {
	const active = new Map();
	const controls = new Map();
	const recent = createRecentLedger(options.maxRecent);

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
		active.set(workerId, next);
		attach(workerId, control);
		return clone(next);
	}

	function attach(workerId, control) {
		const id = idOf(workerId);
		if (!id || typeof control?.reap !== "function") {
			return false;
		}
		controls.set(id, { reap: control.reap });
		return true;
	}

	function update(workerId, patch = {}) {
		const id = idOf(workerId);
		const current = active.get(id);
		if (!current) {
			return null;
		}
		const next = clean({
			...current,
			...patch,
			workerId: id,
			updatedAt: patch.updatedAt || now()
		});
		active.set(id, next);
		return clone(next);
	}

	function claim(workerId, patch = {}) {
		const id = idOf(workerId);
		const current = active.get(id);
		if (!current) {
			return {
				claimed: false,
				record: recent.find(id)
			};
		}
		const control = controls.get(id) || null;
		const record = release(id, {
			...patch,
			state: "reaping",
			reaping: true,
			reapStartedAt: patch.reapStartedAt || now()
		});
		return {
			claimed: true,
			control,
			record
		};
	}

	function finish(workerId, patch = {}) {
		const id = idOf(workerId);
		const record = active.has(id)
			? release(id, patch)
			: recent.merge(id, patch);
		if (!record) {
			return null;
		}
		return {
			counted: recent.markCounted(id),
			record: recent.find(id)
		};
	}

	function release(workerId, patch = {}) {
		const current = active.get(workerId);
		if (!current) {
			return null;
		}
		active.delete(workerId);
		controls.delete(workerId);
		return recent.upsert(clean({
			...current,
			...patch,
			workerId,
			finishedAt: patch.finishedAt || now(),
			heartbeatAt: patch.heartbeatAt || now(),
			_counted: false
		}));
	}

	return {
		activeEntries: () => [...active.entries()].map(([id, value]) => [id, clone(value)]),
		activeWorkers: () => [...active.values()].map(clone),
		attach,
		claim,
		finish,
		get: workerId => clone(active.get(idOf(workerId))),
		recentWorkers: recent.rows,
		register,
		size: () => active.size,
		update
	};
}

function clone(value) {
	return value ? structuredClone(value) : null;
}

function idOf(value) {
	return String(value || "").trim();
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	createStore
};
