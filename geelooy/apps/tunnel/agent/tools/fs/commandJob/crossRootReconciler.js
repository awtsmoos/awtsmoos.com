// B"H
/**
 * @file crossRootReconciler.js
 * @description Reconcile durable jobs in bounded root pages while preserving
 * process identity, exact job ownership, and non-replaying continuation.
 */
const Apply = require("./crossRootApply.js");
const Decision = require("./crossRootDecision.js");
const Lock = require("./crossRootLock.js");
const Scanner = require("./crossRootScanner.js");

/** Scan and optionally reconcile exactly one bounded state-root page. */
async function runBatch(config = {}, options = {}) {
	const scanned = await Scanner.scan(config, options);
	const lock = options.apply === true
		? await Lock.acquire(scanned.discovery.base, options)
		: { ok: true, dryRun: true };
	if (!lock.ok) {
		return {
			ok: true,
			skipped: true,
			reason: lock.reason,
			lock,
			scanned,
			nextRootOffset: scanned.nextRootOffset
		};
	}
	const receipts = [];
	try {
		for (const record of scanned.records) {
			const decision = await Decision.decide(record, options);
			receipts.push(await Apply.apply(record, decision, options));
		}
	} finally {
		if (options.apply === true) await Lock.release(lock);
	}
	return summarize(scanned, receipts, options);
}

/** Launch reconciliation without delaying command admission behind every root. */
async function start(config = {}, log = () => {}, options = {}) {
	const first = await runBatch(config, { ...options, apply: true });
	log(first.ok ? "info" : "warn", `B"H command reconciliation: ${JSON.stringify(first.summary || first)}`);
	if (first.truncated && !first.skipped) {
		scheduleContinuation(config, log, { ...options, rootOffset: first.nextRootOffset }, 1);
	}
	return first;
}

/** Carry forward the precise next root while retaining an eight-batch ceiling. */
function scheduleContinuation(config, log, options, batchNumber) {
	const maxBatches = positive(options.maxBatches, 8);
	if (batchNumber >= maxBatches) return null;
	const timer = setTimeout(async () => {
		try {
			const report = await runBatch(config, { ...options, apply: true });
			log(report.ok ? "info" : "warn", `B"H command reconciliation batch ${batchNumber + 1}: ${JSON.stringify(report.summary || report)}`);
			if (report.truncated && !report.skipped) {
				scheduleContinuation(config, log, {
					...options,
					rootOffset: report.nextRootOffset
				}, batchNumber + 1);
			}
		} catch (error) {
			log("warn", `Command reconciliation continuation failed: ${error.message}`);
		}
	}, positive(options.batchDelayMs, 250));
	timer.unref?.();
	return timer;
}

/** Test or explicitly run successive pages until no roots remain or budget ends. */
async function runUntilSettled(config = {}, options = {}) {
	const maxBatches = positive(options.maxBatches, 16);
	const reports = [];
	let rootOffset = options.rootOffset || 0;
	for (let index = 0; index < maxBatches; index += 1) {
		const report = await runBatch(config, { ...options, rootOffset });
		reports.push(report);
		rootOffset = report.nextRootOffset ?? rootOffset;
		if (!report.truncated || report.skipped) break;
	}
	return {
		ok: reports.every(report => report.ok),
		batches: reports.length,
		reports,
		truncated: reports.at(-1)?.truncated === true
	};
}

/** Preserve existing action counters and expose the continuation cursor. */
function summarize(scanned, receipts, options) {
	const counts = receipts.reduce((map, receipt) => {
		const key = receipt.action || "unknown";
		map[key] = (map[key] || 0) + 1;
		return map;
	}, {});
	return {
		ok: receipts.every(receipt => receipt.ok),
		apply: options.apply === true,
		truncated: scanned.truncated,
		scannedJobs: scanned.seenJobs,
		selectedRoots: scanned.discovery.roots.length,
		totalRoots: scanned.discovery.totalRoots,
		nextRootOffset: scanned.nextRootOffset,
		receipts,
		summary: {
			counts,
			scannedJobs: scanned.seenJobs,
			truncated: scanned.truncated,
			nextRootOffset: scanned.nextRootOffset
		}
	};
}

/** Enforce a finite integer batch budget. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	runBatch,
	runUntilSettled,
	scheduleContinuation,
	start,
	summarize
};
