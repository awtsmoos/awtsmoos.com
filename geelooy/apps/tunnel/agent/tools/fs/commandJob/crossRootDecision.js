// B"H
const Policy = require('./policy.js');
const Identity = require('./processIdentity.js');
const Observe = require('./processObserve.js');

/**
 * B"H — Current exact families are preserved; obsolete exact families are cleaned.
 * Missing or recycled identities become terminal evidence without unsafe signaling.
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
		return finalizeDecision('stale_lost_worker', comparison, 'startup_process_missing');
	}
	if (!comparison.ok) {
		return finalizeDecision(
			'identity_unverified',
			comparison,
			comparison.reason || comparison.state
		);
	}
	if (record.currentRoot === true) {
		return {
			action: 'preserve_current_exact',
			status: 'running',
			expected,
			observed,
			processComparison: comparison
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

function finalizeDecision(status, comparison, error) {
	return {
		action: 'finalize',
		status,
		patch: {
			status,
			startupRecovered: true,
			error,
			processComparison: comparison
		}
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

module.exports = { decide, finalizeDecision, notStartedCleanup, positive };
