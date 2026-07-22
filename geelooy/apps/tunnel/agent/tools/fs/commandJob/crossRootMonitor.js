// B"H
const Identity = require('./processIdentity.js');
const Lifecycle = require('./lifecycle.js');
const Observe = require('./processObserve.js');

const active = new Map();

/** B"H — A preserved exact family remains watched until terminal proof is durable. */
function start(record, decision, options = {}) {
	const key = `${record.stateRoot}:${record.jobId}`;
	if (active.has(key)) {
		return { started: false, existing: true, key };
	}
	const intervalMs = positive(options.recoveredPollMs, 1000);
	const entry = {
		checking: false,
		decision,
		record,
		timer: null
	};
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
		const observe = options.observe || Observe.observe;
		const observed = await Promise.resolve(
			observe(entry.decision.expected.pid)
		);
		const comparison = Identity.compare(entry.decision.expected, observed);
		if (comparison.ok) return;
		const finalize = options.finalize || Lifecycle.finalizeDetached;
		await finalize(
			entry.record.rootConfig,
			entry.record.jobId,
			entry.record.meta,
			terminalPatch(comparison)
		);
		stop(key);
	} catch (error) {
		options.log?.('warn', `Recovered command monitor failed: ${error.message}`);
	} finally {
		entry.checking = false;
	}
}

function terminalPatch(comparison) {
	const dead = comparison.state === 'dead';
	return {
		status: dead ? 'stale_lost_worker' : 'identity_unverified',
		startupRecovered: true,
		startupPreserved: true,
		error: dead
			? 'recovered_process_exited_unobserved'
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
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { active, positive, start, stop, stopAll, terminalPatch, tick };
