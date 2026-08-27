// B"H

/**
 * B"H — A loud agent may fill its own cup, but it cannot drink the river.
 * Round-robin ownership keeps queued command starts fair and globally bounded.
 */
function createFairQueue(options = {}) {
	const queues = new Map();
	const owners = [];
	const maxQueued = positive(options.maxQueued, 1024);
	const maxPerOwner = positive(options.maxPerOwner, 64);
	let total = 0;
	let rejected = 0;

	function enqueue(ownerId, item) {
		const owner = clean(ownerId) || "anonymous";
		const queue = queues.get(owner) || [];
		if (total >= maxQueued) return reject("command_queue_full", owner);
		if (queue.length >= maxPerOwner) return reject("owner_command_queue_full", owner);
		if (!queues.has(owner)) {
			queues.set(owner, queue);
			owners.push(owner);
		}
		queue.push(item);
		total += 1;
		return { ok: true, owner, queued: total, ownerQueued: queue.length };
	}

	function dequeue() {
		if (!owners.length) return null;
		const owner = owners.shift();
		const queue = queues.get(owner);
		const item = queue.shift();
		total -= 1;
		if (queue.length) owners.push(owner);
		else queues.delete(owner);
		return { owner, item };
	}

	function remove(ownerId, predicate = () => true) {
		const owner = clean(ownerId) || "anonymous";
		const queue = queues.get(owner);
		if (!queue) return 0;
		const kept = [];
		let removed = 0;
		for (const item of queue) {
			if (predicate(item)) removed += 1;
			else kept.push(item);
		}
		total -= removed;
		if (kept.length) queues.set(owner, kept);
		else {
			queues.delete(owner);
			const index = owners.indexOf(owner);
			if (index >= 0) owners.splice(index, 1);
		}
		return removed;
	}

	function snapshot() {
		return {
			queued: total,
			owners: owners.length,
			maxQueued,
			maxPerOwner,
			rejected,
			byOwner: Object.fromEntries([...queues].map(([owner, queue]) => [owner, queue.length]))
		};
	}

	function reject(error, owner) {
		rejected += 1;
		return { ok: false, error, status: 429, owner, retryable: true };
	}

	return { dequeue, enqueue, remove, snapshot };
}

function clean(value) {
	return String(value || "").trim();
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { createFairQueue };
