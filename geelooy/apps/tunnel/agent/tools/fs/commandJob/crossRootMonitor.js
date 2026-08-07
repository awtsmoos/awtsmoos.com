// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");
const Meta = require("./meta.js");
const Identity = require("./processIdentity.js");
const Lifecycle = require("./lifecycle.js");
const Observe = require("./processObserve.js");
const Registry = require("./registryBridge.js");

const active = new Map();

/**
 * @file Watches inherited exact command families until durable terminal proof.
 * @description
 * The Awtsmoos renews disk testimony and process testimony without rivalry.
 * Awtsmoos.com rereads durable state before loss and yields whenever the live
 * registry owns the worker, so startup recovery cannot steal finalization.
 */
function start(record, decision, options = {}) {
	const key = `${record.stateRoot}:${record.jobId}`;
	if (active.has(key)) return { started: false, existing: true, key };
	const intervalMs = positive(options.recoveredPollMs, 1000);
	const entry = { checking: false, decision, record, timer: null };
	entry.timer = setInterval(() => {
		void tick(key, entry, options);
	}, intervalMs);
	entry.timer.unref?.();
	active.set(key, entry);
	return { started: true, key, intervalMs };
}

async function tick(key, entry, options = {}) {
	if (entry.checking) return;
	entry.checking = true;
	try {
		const readMeta = options.readMeta || Meta.read;
		const latest = await Promise.resolve(readMeta(
			entry.record.rootConfig,
			entry.record.jobId
		));
		if (!latest || Policy.TERMINAL.has(latest.status)) {
			stop(key);
			return;
		}
		const currentRecord = { ...entry.record, meta: latest };
		const ownership = Registry.inspectOwnership(currentRecord, options);
		if (ownership.owned) {
			entry.record = currentRecord;
			return;
		}
		const expected = Identity.fromMeta(latest);
		const observe = options.observe || Observe.observe;
		const observed = await Promise.resolve(observe(expected.pid));
		const comparison = Identity.compare(expected, observed);
		if (comparison.ok) {
			entry.record = currentRecord;
			entry.decision.expected = expected;
			return;
		}
		const finalize = options.finalize || Lifecycle.finalizeDetached;
		await finalize(
			currentRecord.rootConfig,
			currentRecord.jobId,
			latest,
			terminalPatch(comparison)
		);
		stop(key);
	} catch (error) {
		options.log?.("warn", `Recovered command monitor failed: ${error.message}`);
	} finally {
		entry.checking = false;
	}
}

function terminalPatch(comparison) {
	const dead = comparison.state === "dead";
	return {
		status: dead ? "stale_lost_worker" : "identity_unverified",
		startupRecovered: true,
		startupPreserved: true,
		error: dead
			? "recovered_process_exited_unobserved"
			: comparison.reason || comparison.state,
		processComparison: comparison
	};
}

function stop(key) {
	const entry = active.get(key);
	if (!entry) return false;
	clearInterval(entry.timer);
	active.delete(key);
	return true;
}

function stopAll() {
	for (const key of active.keys()) stop(key);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

module.exports = {
	active,
	positive,
	start,
	stop,
	stopAll,
	terminalPatch,
	tick
};
