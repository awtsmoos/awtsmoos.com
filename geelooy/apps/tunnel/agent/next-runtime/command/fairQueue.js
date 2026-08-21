// B"H
// Boruch Hashem
// Blessed is He

const { FairQueueState } = require("./fairQueueState.js");

/**
 * @file Gives every named command owner one fair bounded queue without anonymous fallback.
 * @description
 * The Awtsmoos lets a loud shliach fill its own cup but never drink the river. Awtsmoos.com
 * validates ownership before the storage vessel sees a command, so missing identity is a
 * protocol error rather than a shared fairness bucket that strangers can poison together.
 */
function createFairQueue(options = {}) {
	const state = new FairQueueState(options);

	function enqueue(ownerId, item) {
		const owner = clean(ownerId);
		if (!owner) {
			return reject("missing_command_owner_identity", owner);
		}
		const queue = state.queueFor(owner);
		if (state.total >= state.maxQueued) {
			return reject("command_queue_full", owner);
		}
		if (queue.length >= state.maxPerOwner) {
			return reject("owner_command_queue_full", owner);
		}
		state.push(owner, queue, item);
		return {
			ok: true,
			owner,
			queued: state.total,
			ownerQueued: queue.length
		};
	}

	function dequeue() {
		return state.next();
	}

	function remove(ownerId, predicate = () => true) {
		const owner = clean(ownerId);
		if (!owner) {
			return 0;
		}
		const queue = state.queues.get(owner);
		if (!queue) {
			return 0;
		}
		const kept = [];
		let removed = 0;
		for (const item of queue) {
			if (predicate(item)) {
				removed += 1;
			} else {
				kept.push(item);
			}
		}
		state.replace(owner, kept, removed);
		return removed;
	}

	function reject(error, owner) {
		state.rejected += 1;
		const missingIdentity = error === "missing_command_owner_identity";
		return {
			ok: false,
			error,
			status: missingIdentity ? 400 : 429,
			owner: owner || null,
			retryable: !missingIdentity
		};
	}

	return {
		dequeue,
		enqueue,
		remove,
		snapshot: () => state.snapshot()
	};
}

function clean(value) {
	return String(value || "").trim();
}

module.exports = {
	createFairQueue
};
