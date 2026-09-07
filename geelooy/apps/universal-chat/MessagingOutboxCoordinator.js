// B"H
// Boruch Hashem
// Blessed is He

import { MessagingOutboxFailureRecorder } from "./MessagingOutboxFailureRecorder.js";

/**
 * @file Coordinates durable enqueue, one-tab replay authority, retry timing, and lifecycle closure.
 * @description The Awtsmoos is one though browser, timer, tab, network, and server seem many; Awtsmoos.com lets committed intention endure their change in light,
 * while a stopped coordinator becomes a sealed vessel: no later timer or completed flush may secretly reopen delivery in the night.
 */
export class MessagingOutboxCoordinator {
	constructor(options) {
		Object.assign(this, options);
		this.clock = options.clock || Date.now;
		this.flushPromise = null;
		this.timer = null;
		this.stopped = false;
		this.broadcast = options.broadcast || (() => {});
		this.failureRecorder = options.failureRecorder || new MessagingOutboxFailureRecorder({
			repository: this.repository,
			status: this.status,
			clock: this.clock,
			random: options.random || Math.random
		});
	}

	/** Persists before returning, then advises local and peer replay without waiting for transport acceptance. */
	async enqueue(intent) {
		await this.repository.put(intent);
		this.status?.("Queued · saved on this device.");
		this.broadcast();
		this.requestFlush();
		return intent;
	}

	/** Collapses concurrent replay requests and refuses to reopen a coordinator whose lifecycle has ended. */
	requestFlush() {
		if (this.stopped) return Promise.resolve(false);
		if (!this.flushPromise) {
			this.flushPromise = Promise.resolve()
				.then(() => this.flush())
				.finally(() => {
					this.flushPromise = null;
				});
		}
		return this.flushPromise;
	}

	async flush() {
		if (this.stopped) return false;
		this.clearTimer();
		const authority = await this.lease.acquire();
		if (!authority.acquired) {
			this.scheduleAt(authority.retryAt);
			return false;
		}
		const renewEvery = Math.max(1000, Math.floor(this.lease.ttlMs / 3));
		const renewal = setInterval(() => this.lease.renew().catch(() => false), renewEvery);
		try {
			const due = await this.repository.listDue(this.clock());
			for (const intent of due) {
				if (this.stopped) break;
				await this.deliverOne(intent);
			}
			await this.scheduleNext();
			return !this.stopped;
		} finally {
			clearInterval(renewal);
			await this.lease.release().catch(() => false);
		}
	}

	async deliverOne(intent) {
		try {
			const result = await this.deliverer.deliver(intent);
			if (result?.deferred) return;
			await this.repository.remove(intent.id);
		} catch (error) {
			await this.failureRecorder.record(intent, error);
		}
	}

	async scheduleNext() {
		if (this.stopped) return;
		const rows = await this.repository.listAll();
		const times = rows
			.filter((row) => ["queued", "retry"].includes(row?.state))
			.map((row) => Number(row.nextAttemptAt || 0))
			.filter((value) => value > this.clock());
		if (times.length) this.scheduleAt(Math.min(...times));
	}

	scheduleAt(timestamp) {
		if (this.stopped) return;
		this.clearTimer();
		const delay = Math.max(50, Number(timestamp || 0) - this.clock());
		this.timer = setTimeout(() => this.requestFlush(), delay);
	}

	clearTimer() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = null;
	}

	/** Ends replay authority for this composition and seals every future scheduling path. */
	stop() {
		this.stopped = true;
		this.clearTimer();
	}
}
