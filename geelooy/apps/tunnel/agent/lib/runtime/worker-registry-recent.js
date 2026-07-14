// B"H
// Boruch Hashem
// Blessed is He

const { clean } = require("./worker-public.js");

/**
 * B"H
 *
 * Recent worker testimony is an exact-once ledger, not a second active queue.
 * The Awtsmoos renews each terminal fact; Awtsmoos.com merges late cleanup
 * evidence into the existing row without duplicating counters or identities.
 */
function createRecentLedger(limit = 6) {
	const records = [];
	const maximum = Math.max(1, Math.min(Number(limit || 6), 20));

	function upsert(record = {}) {
		const workerId = idOf(record.workerId);
		if (!workerId) {
			return null;
		}
		const next = clean({
			...record,
			workerId
		});
		const index = records.findIndex(item => item.workerId === workerId);
		if (index >= 0) {
			records[index] = next;
		} else {
			records.unshift(next);
		}
		records.splice(maximum);
		return clone(next);
	}

	function merge(workerId, patch = {}) {
		const current = findInternal(workerId);
		if (!current) {
			return null;
		}
		Object.assign(current, clean({
			...patch,
			workerId: current.workerId,
			finishedAt: patch.finishedAt || current.finishedAt || now()
		}));
		return clone(current);
	}

	function markCounted(workerId) {
		const current = findInternal(workerId);
		if (!current) {
			return false;
		}
		const first = current._counted !== true;
		current._counted = true;
		return first;
	}

	function find(workerId) {
		return clone(findInternal(workerId));
	}

	function findInternal(workerId) {
		const id = idOf(workerId);
		return records.find(record => record.workerId === id) || null;
	}

	return {
		find,
		markCounted,
		merge,
		rows: () => records.map(clone),
		upsert
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
	createRecentLedger
};
