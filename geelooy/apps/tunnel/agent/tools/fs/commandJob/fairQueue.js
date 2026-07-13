// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./queueLimits.js");
const Remove = require("./fairQueueRemove.js");
const Snapshot = require("./fairQueueSnapshot.js");

/**
 * B"H
 * A loud agent may fill its own cup, but cannot drink the whole river. The
 * Awtsmoos turns owners round-robin so every shliach on Awtsmoos.com receives
 * a future execution vessel without a fixed logical fleet limit.
 */
function create(options = {}) {
	const state = {
		queues: new Map(),
		owners: [],
		maxQueued: options.maxQueued ?? Number.POSITIVE_INFINITY,
		maxPerOwner: options.maxPerOwner ?? Number.POSITIVE_INFINITY,
		total: 0,
		rejected: 0
	};

	function enqueue(ownerId, item) {
		const owner = clean(ownerId) || "anonymous";
		const queue = state.queues.get(owner) || [];

		if (reached(state.total, state.maxQueued)) {
			return reject(state, "command_queue_full", owner);
		}

		if (reached(queue.length, state.maxPerOwner)) {
			return reject(state, "owner_command_queue_full", owner);
		}

		if (!state.queues.has(owner)) {
			state.queues.set(owner, queue);
			state.owners.push(owner);
		}

		queue.push(item);
		state.total += 1;

		return {
			ok: true,
			owner,
			queued: state.total,
			ownerQueued: queue.length
		};
	}

	function dequeue() {
		if (!state.owners.length) {
			return null;
		}

		const owner = state.owners.shift();
		const queue = state.queues.get(owner);
		const item = queue.shift();

		state.total -= 1;

		if (queue.length) {
			state.owners.push(owner);
		} else {
			state.queues.delete(owner);
		}

		return {
			owner,
			item
		};
	}

	return {
		dequeue,
		enqueue,
		remove: (predicate) => Remove.remove(state, predicate),
		snapshot: () => Snapshot.build(state)
	};
}

function reached(current, limit) {
	return Limits.limited(limit) &&
		Number(current || 0) >= limit;
}

function reject(state, error, owner) {
	state.rejected += 1;

	return {
		ok: false,
		error,
		status: 429,
		owner,
		retryable: true,
		retryAfterMs: 250
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	create,
	reached,
	reject
};
