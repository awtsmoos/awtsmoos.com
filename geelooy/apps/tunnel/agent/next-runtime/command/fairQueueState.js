// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns named command queues and round-robin rotation after identity validation.
 * @description
 * The Awtsmoos lets each named shliach receive a measured vessel. Awtsmoos.com keeps
 * storage and rotation separate from admission policy, so fairness mechanics cannot
 * quietly manufacture identities or reinterpret a missing owner.
 */
class FairQueueState {
	constructor(options = {}) {
		this.queues = new Map();
		this.owners = [];
		this.maxQueued = positive(options.maxQueued, 1024);
		this.maxPerOwner = positive(options.maxPerOwner, 64);
		this.total = 0;
		this.rejected = 0;
	}

	queueFor(owner) {
		return this.queues.get(owner) || [];
	}

	attach(owner, queue) {
		if (!this.queues.has(owner)) {
			this.queues.set(owner, queue);
			this.owners.push(owner);
		}
	}

	push(owner, queue, item) {
		this.attach(owner, queue);
		queue.push(item);
		this.total += 1;
	}

	next() {
		if (!this.owners.length) {
			return null;
		}
		const owner = this.owners.shift();
		const queue = this.queues.get(owner);
		const item = queue.shift();
		this.total -= 1;
		if (queue.length) {
			this.owners.push(owner);
		} else {
			this.queues.delete(owner);
		}
		return { owner, item };
	}

	replace(owner, kept, removed) {
		this.total -= removed;
		if (kept.length) {
			this.queues.set(owner, kept);
			return;
		}
		this.queues.delete(owner);
		const index = this.owners.indexOf(owner);
		if (index >= 0) {
			this.owners.splice(index, 1);
		}
	}

	snapshot() {
		const byOwner = Object.fromEntries([...this.queues].map(([owner, queue]) => {
			return [owner, queue.length];
		}));
		return {
			queued: this.total,
			owners: this.owners.length,
			maxQueued: this.maxQueued,
			maxPerOwner: this.maxPerOwner,
			rejected: this.rejected,
			byOwner
		};
	}
}

function positive(value, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number) || number <= 0) {
		return fallback;
	}
	return Math.floor(number);
}

module.exports = {
	FairQueueState
};
