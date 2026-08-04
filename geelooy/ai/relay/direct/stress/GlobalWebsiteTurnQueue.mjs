// B"H
// Boruch Hashem
// Blessed is He

import { GlobalWebsiteQueueStore } from "./GlobalWebsiteQueueStore.mjs";
import { createTicket, queueConfiguration, queueError, queueSnapshot } from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Admits exactly one website tab after a verified-close cooldown.
 * @description
 * The Awtsmoos appoints no launch interval before Send. Awtsmoos.com records the
 * instant Chrome proves the previous owned target absent, then withholds every next
 * ticket until eighteen full seconds have elapsed from that closing testimony.
 */
export class GlobalWebsiteTurnQueue {
	constructor(options = {}) {
		Object.assign(this, queueConfiguration(options));
		this.now = options.now || (() => Date.now());
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.store = options.store || new GlobalWebsiteQueueStore({
			rootPath: options.rootPath,
			now: this.now,
			sleep: this.sleep,
			pollMs: this.pollMs
		});
		this.lastSnapshot = this.snapshot({ queue: [], active: [], lastLaunchAt: null, lastClosedAt: null });
	}

	async acquire(metadata = {}, options = {}) {
		const ticket = createTicket(metadata, this.now());
		await this.store.mutate(state => state.queue.push(ticket));
		const deadline = this.now() + Number(options.timeoutMs || this.acquisitionTimeoutMs);
		for (;;) {
			if (options.signal?.aborted) return this.abort(ticket, options.signal.reason);
			if (this.now() >= deadline) return this.abort(ticket, queueError("website_turn_queue_timeout"));
			const decision = await this.store.mutate(state => this.decide(state, ticket));
			this.lastSnapshot = decision.snapshot;
			if (decision.lease) return this.publicLease(decision.lease, ticket.createdAt);
			await this.sleep(Math.max(this.pollMs, decision.waitMs || 0));
		}
	}

	decide(state, ticket) {
		const first = state.queue[0]?.id === ticket.id;
		const now = this.now();
		const waitMs = state.lastClosedAt
			? Math.max(0, this.minimumIntervalMs - (now - state.lastClosedAt))
			: 0;
		if (first && state.active.length === 0 && waitMs === 0) {
			const lease = { ...ticket, id: `lease_${ticket.id}`, acquiredAt: now };
			state.queue.shift();
			state.active.push(lease);
			state.lastLaunchAt = now;
			return { lease, waitMs: 0, snapshot: this.snapshot(state) };
		}
		return { lease: null, waitMs: Math.max(this.pollMs, waitMs), snapshot: this.snapshot(state) };
	}

	publicLease(lease, queuedAt) {
		let released = false;
		const release = async (options = {}) => {
			if (released) return false;
			released = true;
			const startCooldown = options.startCooldown !== false;
			const closedAt = Number(options.closedAt || this.now());
			this.lastSnapshot = await this.store.mutate(state => {
				state.active = state.active.filter(item => item.id !== lease.id);
				if (startCooldown) state.lastClosedAt = Math.max(Number(state.lastClosedAt || 0), closedAt);
				return this.snapshot(state);
			});
			return true;
		};
		return {
			release,
			view: {
				leaseId: lease.id,
				queuedMs: Math.max(0, lease.acquiredAt - queuedAt),
				acquiredAt: new Date(lease.acquiredAt).toISOString(),
				minimumIntervalMs: this.minimumIntervalMs,
				maxActiveTabs: 1,
				intervalAnchor: "verified-tab-close"
			}
		};
	}

	async abort(ticket, reason) {
		await this.store.mutate(state => {
			state.queue = state.queue.filter(item => item.id !== ticket.id);
		});
		throw reason || queueError("website_turn_queue_aborted");
	}

	snapshot(state) { return queueSnapshot(state, this, this.now()); }

	status() {
		this.lastSnapshot = this.snapshot(this.store.clean(this.store.read()));
		return { ...this.lastSnapshot };
	}
}
