// B"H
const fs = require("node:fs");
const path = require("node:path");
const Atomic = require("./atomicMeta.js");
const Reconciler = require("./reconciler.js");
const Roots = require("./stateRoots.js");
const Transitions = require("./transitions.js");

/**
 * B"H — Old project roots are examined in bounded batches. Terminal history may
 * age away; living or ambiguous work is reconciled instead of blindly deleted.
 */
function plan(config = {}, options = {}) {
	const roots = Roots.listStateRoots(config, options);
	const now = Number(options.now || Date.now());
	const terminalRetentionMs = positive(options.terminalRetentionMs, 24 * 60 * 60 * 1000);
	const actions = [];
	let scannedJobs = 0;
	for (const root of roots.roots) {
		const listing = Roots.listJobDirectories(root.path, options);
		for (const job of listing.jobs) {
			const metaPath = path.join(job.path, "meta.json");
			const meta = Atomic.read(metaPath, null);
			if (!meta) continue;
			scannedJobs += 1;
			const state = String(meta.status || meta.state || "unknown");
			const ageMs = now - Date.parse(meta.finishedAt || meta.updatedAt || meta.startedAt || 0);
			if (Transitions.isTerminal(state) && ageMs >= terminalRetentionMs) {
				actions.push({ action: "remove_terminal", stateRoot: root.path, jobPath: job.path, metaPath, jobId: meta.jobId || job.jobId, ageMs });
			} else if (!Transitions.isTerminal(state)) {
				const decision = Reconciler.decide(meta, options);
				actions.push({ action: decision.action, stateRoot: root.path, jobPath: job.path, metaPath, jobId: meta.jobId || job.jobId, decision });
			}
		}
	}
	return { roots, scannedJobs, actions, dryRun: options.apply !== true };
}

function apply(planResult, options = {}) {
	const receipts = [];
	for (const item of planResult.actions || []) {
		try {
			if (item.action === "remove_terminal") fs.rmSync(item.jobPath, { recursive: true, force: true });
			else if (["finalize", "adopt"].includes(item.action)) Atomic.write(item.metaPath, item.decision.meta, { incrementRevision: false });
			receipts.push({ ...item, ok: true });
		} catch (error) {
			receipts.push({ ...item, ok: false, error: error.message });
		}
	}
	return { ok: receipts.every(receipt => receipt.ok), receipts, appliedAt: new Date().toISOString(), options };
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}
module.exports = { apply, plan };
