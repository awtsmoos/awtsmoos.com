// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./policy.js");
const Identity = require("./processIdentity.js");
const Observe = require("./processObserve.js");
const Registry = require("./registryBridge.js");

/**
 * @file Decides startup reconciliation without stealing a living command's end.
 * @description
 * The Awtsmoos reveals one exact family beneath many scans. Awtsmoos.com keeps
 * a registry-owned worker with its original listeners and monitors only work
 * inherited from a former process lifetime.
 */
async function decide(record, options = {}) {
	const meta = record.meta || {};
	const status = String(meta.status || "unknown");
	const now = Number(options.now || Date.now());
	const retentionMs = Policy.boundedNumber(
		options.terminalRetentionMs,
		Policy.TTL_MS,
		1,
		Number.MAX_SAFE_INTEGER
	);
	if (Policy.TERMINAL.has(status)) {
		const finishedAt = Date.parse(
			meta.finishedAt || meta.updatedAt || meta.startedAt || 0
		) || 0;
		return now - finishedAt >= retentionMs
			? { action: "remove_terminal", status, ageMs: now - finishedAt }
			: { action: "keep_terminal", status, ageMs: now - finishedAt };
	}
	if (status === "queued") {
		return {
			action: "finalize",
			status: "cancelled",
			patch: {
				status: "cancelled",
				cancelled: true,
				startupRecovered: true,
				cleanup: notStartedCleanup()
			}
		};
	}
	const ownership = Registry.inspectOwnership(record, options);
	if (ownership.owned) {
		return {
			action: "preserve_live_owned",
			status,
			ownership,
			expected: ownership.comparison.expected,
			observed: ownership.comparison.observed
		};
	}
	const expected = Identity.fromMeta(meta);
	const observe = options.observe || Observe.observe;
	const observed = await Promise.resolve(observe(expected.pid));
	const comparison = Identity.compare(expected, observed);
	if (comparison.state === "dead") {
		return finalizeDecision(
			"stale_lost_worker",
			comparison,
			"startup_process_missing"
		);
	}
	if (!comparison.ok) {
		return finalizeDecision(
			"identity_unverified",
			comparison,
			comparison.reason || comparison.state
		);
	}
	if (record.currentRoot === true) {
		return {
			action: "preserve_current_exact",
			status: "running",
			expected,
			observed,
			processComparison: comparison
		};
	}
	return {
		action: "cleanup_exact",
		status: "running",
		expected,
		observed,
		processComparison: comparison
	};
}

function finalizeDecision(status, comparison, error) {
	return {
		action: "finalize",
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
		state: "not_started",
		signals: [],
		at: new Date().toISOString()
	};
}

module.exports = {
	decide,
	finalizeDecision,
	notStartedCleanup
};
