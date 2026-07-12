// B"H

/**
 * B"H — The registry remembers only living ownership and a bounded echo of what
 * finished. It refuses growth before memory pressure can silence human control.
 */
function createActiveRegistry(options = {}) {
	const active = new Map();
	const recent = [];
	const maxActive = positive(options.maxActive, 32);
	const maxRecent = positive(options.maxRecent, 32);
	let rejected = 0;

	function register(record = {}) {
		const workerId = clean(record.workerId);
		if (!workerId) return { ok: false, error: "missing_worker_id" };
		if (active.has(workerId)) return { ok: true, duplicate: true, record: clone(active.get(workerId)) };
		if (active.size >= maxActive) {
			rejected += 1;
			return { ok: false, error: "worker_registry_full", active: active.size, maxActive };
		}
		const next = { ...record, workerId, state: record.state || "running", registeredAt: now() };
		active.set(workerId, next);
		return { ok: true, duplicate: false, record: clone(next) };
	}

	function update(workerId, patch = {}) {
		const id = clean(workerId);
		const current = active.get(id);
		if (!current) return null;
		const next = { ...current, ...patch, workerId: id, updatedAt: now() };
		active.set(id, next);
		return clone(next);
	}

	function finish(workerId, patch = {}) {
		const id = clean(workerId);
		const current = active.get(id) || { workerId: id };
		const finalRecord = {
			...current,
			...patch,
			workerId: id,
			state: patch.state || current.state || "completed",
			finishedAt: patch.finishedAt || now()
		};
		active.delete(id);
		recent.unshift(finalRecord);
		recent.splice(maxRecent);
		return clone(finalRecord);
	}

	function release(workerId) {
		return active.delete(clean(workerId));
	}

	function snapshot() {
		return {
			active: active.size,
			maxActive,
			recent: recent.length,
			maxRecent,
			rejected,
			workers: [...active.values()].map(clone),
			recentWorkers: recent.map(clone)
		};
	}

	return { finish, register, release, snapshot, update };
}

function now() {
	return new Date().toISOString();
}

function clean(value) {
	return String(value || "").trim();
}

function clone(value) {
	return structuredClone(value);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { createActiveRegistry };
