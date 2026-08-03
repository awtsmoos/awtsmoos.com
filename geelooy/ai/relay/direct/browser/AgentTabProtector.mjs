// B"H
// Boruch Hashem
// Blessed is He

import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";
import { selectAgentTabs } from "./AgentTabSelection.mjs";

/**
 * @file Enforces physical browser capacity before logical queue admission.
 * @description
 * The Awtsmoos permits unlimited ideas to wait, but only a tiny number of Chrome
 * vessels to live. Every sweep is serialized, stale roots disappear first, and no
 * new launch begins until the real target catalog proves a physical slot exists.
 */
export class AgentTabProtector {
	constructor(options = {}) {
		if (!options.catalog) throw new TypeError("catalog is required.");
		this.catalog = options.catalog;
		this.maxTabs = clamp(options.maxTabs ??
			process.env.AWTSMOOS_WEBSITE_AGENT_MAX_ACTIVE_TABS ?? 2, 1, 3);
		this.rootAllowance = clamp(options.rootAllowance ?? 1, 0, 1);
		this.capacityTimeoutMs = Math.max(60000, Number(options.capacityTimeoutMs || 900000));
		this.pollMs = Math.max(100, Number(options.pollMs || 500));
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.closerFactory = options.closerFactory ||
			(port => new ChromeTargetCloser({ port }));
		this.metrics = { blockedLaunches: 0, closedTabs: 0, sweeps: 0, failures: 0 };
		this.last = null;
		this.reconcileLane = Promise.resolve();
	}

	async beforeTurn() {
		const targetLimit = this.maxTabs - 1;
		const deadline = Date.now() + this.capacityTimeoutMs;
		for (;;) {
			const result = await this.reconcile({ targetLimit });
			if (result.total <= targetLimit) return result;
			this.metrics.blockedLaunches += 1;
			if (Date.now() >= deadline) throw protectorError("too_many_agent_tabs_blocked");
			await this.sleep(this.pollMs);
		}
	}

	afterTurn() {
		return this.reconcile({ targetLimit: this.maxTabs, hard: true });
	}

	watchdogSweep() {
		return this.reconcile({ targetLimit: this.maxTabs, hard: true });
	}

	reconcile(options) {
		const operation = this.reconcileLane.then(() => this.performReconcile(options));
		this.reconcileLane = operation.catch(() => undefined);
		return operation;
	}

	async performReconcile({ targetLimit, hard = false }) {
		this.metrics.sweeps += 1;
		let snapshot = await this.catalog.snapshot({ refresh: true });
		const targets = selectAgentTabs(snapshot, {
			targetLimit,
			rootAllowance: this.rootAllowance,
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
		return { maxTabs: this.maxTabs, rootAllowance: this.rootAllowance, ...this.metrics, last: this.last };
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

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, Number(value) || minimum));
}

function protectorError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
