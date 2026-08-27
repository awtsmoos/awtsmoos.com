// B"H
// Boruch Hashem
// Blessed is He

import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";
import { selectAgentTabs } from "./AgentTabSelection.mjs";

/**
 * @file Enforces an empty agent browser before every single-tab launch.
 * @description
 * The Awtsmoos permits unlimited queued intentions, yet Awtsmoos.com admits one
 * physical agent tab only. Every stale root or conversation left by a bypass is
 * conclusively closed before a new prompt vessel can be created.
 */
export class AgentTabProtector {
	constructor(options = {}) {
		if (!options.catalog) throw new TypeError("catalog is required.");
		this.catalog = options.catalog;
		this.maxTabs = 1;
		this.rootAllowance = 0;
		this.capacityTimeoutMs = Math.max(60000, Number(options.capacityTimeoutMs || 900000));
		this.pollMs = Math.max(100, Number(options.pollMs || 250));
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.closerFactory = options.closerFactory || (port => new ChromeTargetCloser({ port }));
		this.metrics = { blockedLaunches: 0, closedTabs: 0, sweeps: 0, failures: 0 };
		this.last = null;
		this.reconcileLane = Promise.resolve();
	}

	async beforeTurn() {
		const deadline = Date.now() + this.capacityTimeoutMs;
		for (;;) {
			const result = await this.reconcile({ targetLimit: 0, hard: true });
			if (result.total === 0) return result;
			this.metrics.blockedLaunches += 1;
			if (Date.now() >= deadline) throw protectorError("too_many_agent_tabs_blocked");
			await this.sleep(this.pollMs);
		}
	}

	afterTurn() {
		return this.reconcile({ targetLimit: 0, hard: true });
	}

	watchdogSweep() {
		return this.reconcile({ targetLimit: 1, hard: true });
	}

	reconcile(options) {
		const operation = this.reconcileLane.then(() => this.performReconcile(options));
		this.reconcileLane = operation.catch(() => undefined);
		return operation;
	}

	async performReconcile({ targetLimit, hard }) {
		this.metrics.sweeps += 1;
		let snapshot = await this.catalog.snapshot({ refresh: true });
		const targets = selectAgentTabs(snapshot, {
			targetLimit,
			rootAllowance: 0,
			hard
		});
		for (const target of targets) {
			const outcome = await this.closerFactory(snapshot.port).close(target.id);
			if (outcome.verified) this.metrics.closedTabs += 1;
			else this.metrics.failures += 1;
		}
		if (targets.length) snapshot = await this.catalog.snapshot({ refresh: true });
		this.last = publicSnapshot(snapshot, targetLimit, targets.length);
		return this.last;
	}

	status() {
		return { maxTabs: 1, rootAllowance: 0, ...this.metrics, last: this.last };
	}
}

function publicSnapshot(snapshot, targetLimit, closeRequested) {
	return {
		port: snapshot.port,
		total: snapshot.total,
		rootTabs: snapshot.rootTabs.length,
		conversationTabs: snapshot.conversationTabs.length,
		targetLimit,
		closeRequested,
		withinLimit: snapshot.total <= targetLimit
	};
}

function protectorError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
