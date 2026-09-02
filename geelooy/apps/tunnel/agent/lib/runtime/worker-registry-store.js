// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");
const { createActiveRegistry } = require("./worker-registry-active.js");
const { createRecentLedger } = require("./worker-registry-recent.js");

/**
 * @file Moves workers between active ownership and recent exact-once testimony.
 * @description
 * The Awtsmoos renews active custody and terminal memory without letting them blur.
 * Awtsmoos.com now exposes a non-mutating preflight before any reap claim, so private
 * command liveness can veto stale reclamation while timeout and cancellation retain power.
 */
function createStore(options = {}) {
	const active = createActiveRegistry();
	const recent = createRecentLedger(options.maxRecent);

	async function preflight(workerId, request = {}) {
		return active.preflight(workerId, request);
	}

	function claim(workerId, patch = {}) {
		const released = active.release(workerId);
		if (!released) {
			return {
				claimed: false,
				record: recent.find(workerId)
			};
		}
		const record = recent.upsert(terminalRecord(
			released.record,
			{
				...patch,
				state: "reaping",
				reaping: true,
				reapStartedAt: patch.reapStartedAt || now()
			}
		));
		return {
			claimed: true,
			control: released.control,
			record
		};
	}

	function finish(workerId, patch = {}) {
		const released = active.release(workerId);
		const record = released
			? recent.upsert(terminalRecord(released.record, patch))
			: recent.merge(workerId, patch);
		if (!record) return null;
		return {
			counted: recent.markCounted(workerId),
			record: recent.find(workerId)
		};
	}

	function terminalRecord(current = {}, patch = {}) {
		return clean({
			...current,
			...patch,
			workerId: current.workerId,
			finishedAt: patch.finishedAt || now(),
			heartbeatAt: patch.heartbeatAt || now(),
			_counted: false
		});
	}

	return {
		activeEntries: active.entries,
		activeWorkers: active.values,
		attach: active.attach,
		claim,
		finish,
		get: active.get,
		preflight,
		recentWorkers: recent.rows,
		register: active.register,
		size: active.size,
		update: active.update
	};
}

function now() {
	return new Date().toISOString();
}

module.exports = { createStore };
