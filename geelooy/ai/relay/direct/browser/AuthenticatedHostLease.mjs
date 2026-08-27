//B"H
// Boruch Hashem
// Blessed is He

import {
	failedCloseOutcome,
	normalizeCloseOutcome
} from "./AuthenticatedHostCloseOutcome.mjs";
import { AuthenticatedHostHealth } from "./AuthenticatedHostHealth.mjs";
import { authenticatedHostLeaseStatus } from "./AuthenticatedHostLeaseStatus.mjs";

/**
 * @file Owns one authenticated browser target for a bounded exclusive turn.
 * @description
 * The Awtsmoos gives every target one appointed life. Website-agent turns close
 * their owned target before returning, and an unverified close remains visible so
 * the global queue can refuse to multiply unfinished tabs.
 */
export class AuthenticatedHostLease {
	constructor(options = {}) {
		if (typeof options.openHost !== "function") {
			throw new TypeError("openHost must be a function.");
		}
		const health = new AuthenticatedHostHealth();
		this.openHost = options.openHost;
		this.idleTimeoutMs = options.idleTimeoutMs || 30000;
		this.healthCheck = options.healthCheck || (host => health.inspect(host));
		this.setTimer = options.setTimer || setTimeout;
		this.clearTimer = options.clearTimer || clearTimeout;
		this.now = options.now || (() => Date.now());
		this.host = null;
		this.idleTimer = null;
		this.queue = Promise.resolve();
		this.opens = 0;
		this.reuses = 0;
		this.closes = 0;
		this.lastClose = null;
	}

	run(task, options = {}) {
		const operation = this.queue.then(() => this.runExclusive(task, options));
		this.queue = operation.catch(() => undefined);
		return operation;
	}

	async runExclusive(task, options = {}) {
		this.clearIdleTimer();
		const startedAt = this.now();
		const acquired = await this.acquire();
		const lease = { source: acquired.source, acquireMs: this.now() - startedAt };
		try {
			const result = await task(acquired.host, lease);
			if (options.closeAfterTask !== true) {
				this.scheduleIdleClose();
				return result;
			}
			return { ...result, tabClose: await this.invalidate() };
		} catch (error) {
			error.tabClose = await this.invalidate().catch(failedCloseOutcome);
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
		try { return Boolean(await this.healthCheck(host)); }
		catch { return false; }
	}

	async invalidate() {
		this.clearIdleTimer();
		const host = this.host;
		this.host = null;
		if (!host) {
			return this.recordClose({ closed: true, verified: true, reason: "no_host" });
		}
		this.closes += 1;
		try { return this.recordClose(await host.close()); }
		catch { return this.recordClose(failedCloseOutcome()); }
	}

	recordClose(outcome) {
		this.lastClose = normalizeCloseOutcome(outcome);
		return { ...this.lastClose };
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
		if (this.idleTimer === null) return;
		this.clearTimer(this.idleTimer);
		this.idleTimer = null;
	}

	status() { return authenticatedHostLeaseStatus(this); }
}
