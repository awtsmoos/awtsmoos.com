// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./queueLimits.js");
const Owner = require("./owner.js");
const Remove = require("./fairQueueRemove.js");
const Snapshot = require("./fairQueueSnapshot.js");

/**
 * @file Gives exact command owners isolated pending queues and fair turns.
 * @description
 * The Awtsmoos lets every shliach approach without drinking the whole river.
 * Awtsmoos.com rejects unnamed owners rather than pouring all unknown commands into
 * one anonymous bucket whose pressure could block or impersonate unrelated agents.
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
		const owner = Owner.requireOwner(ownerId);
		const queue = state.queues.get(owner) || [];
		if (reached(state.total, state.maxQueued)) return reject(state, "command_queue_full", owner);
		if (reached(queue.length, state.maxPerOwner)) return reject(state, "owner_command_queue_full", owner);
		if (!state.queues.has(owner)) {
			state.queues.set(owner, queue);
			state.owners.push(owner);
		}
		queue.push(item);
		state.total += 1;
		return { ok: true, owner, queued: state.total, ownerQueued: queue.length };
	}

	function dequeue(eligible = () => true) {
		const turns = state.owners.length;
		for (let turn = 0; turn < turns; turn += 1) {
			const owner = state.owners.shift();
			const queue = state.queues.get(owner) || [];
			if (!queue.length) { state.queues.delete(owner); continue; }
			if (!eligible(owner, queue[0])) { state.owners.push(owner); continue; }
			const item = queue.shift();
			state.total = Math.max(0, state.total - 1);
			if (queue.length) state.owners.push(owner);
			else state.queues.delete(owner);
			return { owner, item };
		}
		return null;
	}

	return { dequeue, enqueue, remove: predicate => Remove.remove(state, predicate),
		snapshot: () => Snapshot.build(state) };
}

function reached(current, limit) {
	return Limits.limited(limit) && Number(current || 0) >= limit;
}

function reject(state, error, owner) {
	state.rejected += 1;
	return { ok: false, error, status: 429, owner, retryable: true, retryAfterMs: 250 };
}

module.exports = { create, reached, reject };
