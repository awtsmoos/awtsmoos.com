// B"H
const Policy = require('./policy.js');
const Identity = require('./processIdentity.js');
const Observe = require('./processObserve.js');

/**
 * B"H — Planning observes but never signals. Exact surviving families are named
 * for cleanup; recycled or missing identity becomes terminal evidence.
 */
async function decide(record, options = {}) {
	const meta = record.meta || {};
	const status = String(meta.status || 'unknown');
	const now = Number(options.now || Date.now());
	const retentionMs = positive(
		options.terminalRetentionMs,
		Number(process.env.AWTSMOOS_COMMAND_JOB_TTL_MS || 30 * 60 * 1000)
	);
	if (Policy.TERMINAL.has(status)) {
		const finishedAt = Date.parse(
			meta.finishedAt || meta.updatedAt || meta.startedAt || 0
		) || 0;
		return now - finishedAt >= retentionMs
			? { action: 'remove_terminal', status, ageMs: now - finishedAt }
			: { action: 'keep_terminal', status, ageMs: now - finishedAt };
	}
	if (status === 'queued') {
		return {
			action: 'finalize',
			status: 'cancelled',
			patch: {
				status: 'cancelled',
				cancelled: true,
				startupRecovered: true,
				cleanup: notStartedCleanup()
			}
		};
	}
	const expected = Identity.fromMeta(meta);
	const observe = options.observe || Observe.observe;
	const observed = await Promise.resolve(observe(expected.pid));
	const comparison = Identity.compare(expected, observed);
	if (comparison.state === 'dead') {
		return {
			action: 'finalize',
			status: 'stale_lost_worker',
			patch: {
				status: 'stale_lost_worker',
				startupRecovered: true,
				error: 'startup_process_missing',
				processComparison: comparison
			}
		};
	}
	if (!comparison.ok) {
		return {
			action: 'finalize',
			status: 'identity_unverified',
			patch: {
				status: 'identity_unverified',
				startupRecovered: true,
				error: comparison.reason || comparison.state,
				processComparison: comparison
			}
		};
	}
	return {
		action: 'cleanup_exact',
		status: 'running',
		expected,
		observed,
		processComparison: comparison
	};
}

function notStartedCleanup() {
	return {
		ok: true,
		state: 'not_started',
		signals: [],
		at: new Date().toISOString()
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { decide, notStartedCleanup, positive };
