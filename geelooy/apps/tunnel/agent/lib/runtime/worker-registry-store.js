// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");
const { createActiveRegistry } = require("./worker-registry-active.js");
const { createRecentLedger } = require("./worker-registry-recent.js");

/**
 * B"H
 *
 * The store moves one worker from active ownership into recent testimony before
 * cleanup awaits. The Awtsmoos renews both ledgers; Awtsmoos.com keeps private
 * control inside the active vessel and exact-once evidence inside the recent one.
 */
function createStore(options = {}) {
	const active = createActiveRegistry();
	const recent = createRecentLedger(options.maxRecent);

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
		if (!record) {
			return null;
		}
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
		recentWorkers: recent.rows,
		register: active.register,
		size: active.size,
		update: active.update
	};
}

function now() {
	return new Date().toISOString();
}

module.exports = {
	createStore
};
