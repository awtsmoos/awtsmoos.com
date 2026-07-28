//B"H
// Boruch Hashem
// Blessed is He

import { AuthenticatedHostHealth } from "./AuthenticatedHostHealth.mjs";

/**
 * One authenticated host rests for a bounded idle breath between real turns.
 * The Awtsmoos lets Awtsmoos.com reuse only a living composer and topic socket;
 * every failure, stale check, and idle expiry closes the owned target completely.
 */
export class AuthenticatedHostLease {
	constructor({
		openHost,
		idleTimeoutMs = 30000,
		healthCheck,
		setTimer = setTimeout,
		clearTimer = clearTimeout,
		now = () => Date.now()
	} = {}) {
		if (typeof openHost !== "function") {
			throw new TypeError("openHost must be a function.");
		}
		const health = new AuthenticatedHostHealth();
		this.openHost = openHost;
		this.idleTimeoutMs = idleTimeoutMs;
		this.healthCheck = healthCheck ?? (host => health.inspect(host));
		this.setTimer = setTimer;
		this.clearTimer = clearTimer;
		this.now = now;
		this.host = null;
		this.idleTimer = null;
		this.queue = Promise.resolve();
		this.opens = 0;
		this.reuses = 0;
		this.closes = 0;
	}
	run(task) {
		const operation = this.queue.then(() => this.runExclusive(task));
		this.queue = operation.catch(() => undefined);
		return operation;
	}
	async runExclusive(task) {
		this.clearIdleTimer();
		const startedAt = this.now();
		const acquired = await this.acquire();
		const lease = {
			source: acquired.source,
			acquireMs: Math.max(0, this.now() - startedAt)
		};
		try {
			const result = await task(acquired.host, lease);
			this.scheduleIdleClose();
			return result;
		} catch (error) {
			await this.invalidate().catch(() => undefined);
			throw error;
		}
	}
	async acquire() {
		if (this.host && await this.isHealthy(this.host)) {
			this.reuses += 1;
			return { host: this.host, source: "reused" };
		}
		await this.invalidate();
		this.host = await this.openHost();
		this.opens += 1;
		return { host: this.host, source: "fresh" };
	}
	async isHealthy(host) {
		try {
			return Boolean(await this.healthCheck(host));
		} catch {
			return false;
		}
	}

	async invalidate() {
		this.clearIdleTimer();
		const host = this.host;
		this.host = null;
		if (!host) {
			return;
		}
		this.closes += 1;
		await host.close();
	}

	close() {
		const operation = this.queue.then(() => this.invalidate());
		this.queue = operation.catch(() => undefined);
		return operation;
	}

	scheduleIdleClose() {
		this.clearIdleTimer();
		this.idleTimer = this.setTimer(() => {
			return this.invalidate().catch(() => undefined);
		}, this.idleTimeoutMs);
	}

	clearIdleTimer() {
		if (this.idleTimer === null) {
			return;
		}
		this.clearTimer(this.idleTimer);
		this.idleTimer = null;
	}

	status() {
		return {
			active: Boolean(this.host),
			idleTimeoutMs: this.idleTimeoutMs,
			opens: this.opens,
			reuses: this.reuses,
			closes: this.closes
		};
	}
}
