// B"H
// Boruch Hashem
// Blessed is He

import { ChromeTargetCloser } from "./ChromeTargetCloser.mjs";
import { AgentTabProtectionState } from "./AgentTabProtectionState.mjs";
import { selectAgentTabs } from "./AgentTabSelection.mjs";

/**
 * @file Enforces browser capacity without destroying leased human login surfaces.
 * @description
 * The Awtsmoos permits pruning only after exact custody is known. Awtsmoos.com
 * removes abandoned agent tabs while protected login targets remain outside the
 * destructive selection set until authentication releases their bounded lease.
 */
export class AgentTabProtector {
	constructor(options = {}) {
		if (!options.catalog) throw new TypeError("catalog is required.");
		this.catalog = options.catalog;
		this.capacityTimeoutMs = Math.max(60000, Number(options.capacityTimeoutMs || 900000));
		this.pollMs = Math.max(100, Number(options.pollMs || 250));
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.closerFactory = options.closerFactory || (port => new ChromeTargetCloser({ port }));
		this.protection = options.protection || new AgentTabProtectionState();
		this.metrics = { blockedLaunches: 0, closedTabs: 0, sweeps: 0, failures: 0 };
		this.last = null;
		this.reconcileLane = Promise.resolve();
	}

	protectTarget(targetId, options = {}) {
		return this.protection.protect(targetId, options);
	}

	releaseProtections(kind = "") {
		return this.protection.release(kind);
	}

	suspendClosures() {
		return this.protection.suspend();
	}

	resumeClosures() {
		return this.protection.resume();
	}

	async beforeTurn() {
		const deadline = Date.now() + this.capacityTimeoutMs;
		for (;;) {
			const result = await this.reconcile({ targetLimit: 0, hard: true });
			if (result.actionableTotal === 0) return result;
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
		let actionable = this.protection.filter(snapshot);
		if (this.protection.suspensions > 0) {
			return this.remember(snapshot, actionable, targetLimit, 0);
		}
		const targets = selectAgentTabs(actionable, { targetLimit, rootAllowance: 0, hard });
		for (const target of targets) {
			const outcome = await this.closerFactory(snapshot.port).close(target.id);
			if (outcome.verified) this.metrics.closedTabs += 1;
			else this.metrics.failures += 1;
		}
		if (targets.length) snapshot = await this.catalog.snapshot({ refresh: true });
		actionable = this.protection.filter(snapshot);
		return this.remember(snapshot, actionable, targetLimit, targets.length);
	}

	remember(snapshot, actionable, targetLimit, closeRequested) {
		this.last = {
			port: snapshot.port,
			total: snapshot.total,
			actionableTotal: actionable.total,
			rootTabs: snapshot.rootTabs.length,
			conversationTabs: snapshot.conversationTabs.length,
			targetLimit,
			closeRequested,
			withinLimit: actionable.total <= targetLimit
		};
		return this.last;
	}

	status() {
		return { maxTabs: 1, rootAllowance: 0, ...this.protection.status(),
			...this.metrics, last: this.last };
	}
}

function protectorError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
