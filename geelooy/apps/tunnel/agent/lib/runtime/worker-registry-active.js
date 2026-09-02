// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");

/**
 * @file Keeps active worker testimony and private cleanup controls under one exact identity.
 * @description
 * The Awtsmoos renews visible record and hidden control without confusing their forms.
 * Awtsmoos.com lets stale-worker recovery ask a private preflight question before ownership
 * moves, so a living process family remains supervised while destructive cleanup stays fenced.
 */
function createActiveRegistry() {
	const records = new Map();
	const controls = new Map();

	function register(record = {}, control = null) {
		const workerId = idOf(record.workerId);
		if (!workerId) return null;
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

	/** Stores only approved private control functions; records never expose them publicly. */
	function attach(workerId, control) {
		const id = idOf(workerId);
		if (!id || typeof control?.reap !== "function") return false;
		controls.set(id, {
			reap: control.reap,
			reapPreflight: typeof control.reapPreflight === "function"
				? control.reapPreflight
				: null
		});
		return true;
	}

	function update(workerId, patch = {}) {
		const id = idOf(workerId);
		const current = records.get(id);
		if (!current) return null;
		const next = clean({
			...current,
			...patch,
			workerId: id,
			updatedAt: patch.updatedAt || now()
		});
		records.set(id, next);
		return clone(next);
	}

	/** Invokes optional private stale-reap testimony without releasing active ownership. */
	async function preflight(workerId, request = {}) {
		const id = idOf(workerId);
		if (!records.has(id)) return { supported: false, defer: false, reason: "worker_not_active" };
		const callback = controls.get(id)?.reapPreflight;
		if (typeof callback !== "function") {
			return { supported: false, defer: false, reason: "preflight_not_supported" };
		}
		try {
			const result = await callback(request);
			return { supported: true, ...(result || {}) };
		} catch (error) {
			return {
				supported: true,
				defer: true,
				reason: "reap_preflight_failed",
				error: error?.message || String(error)
			};
		}
	}

	function release(workerId) {
		const id = idOf(workerId);
		const record = records.get(id);
		if (!record) return null;
		const control = controls.get(id) || null;
		records.delete(id);
		controls.delete(id);
		return { control, record: clone(record) };
	}

	return {
		attach,
		entries: () => [...records.entries()].map(([id, value]) => [id, clone(value)]),
		get: workerId => clone(records.get(idOf(workerId))),
		has: workerId => records.has(idOf(workerId)),
		preflight,
		register,
		release,
		size: () => records.size,
		update,
		values: () => [...records.values()].map(clone)
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

module.exports = { createActiveRegistry };
