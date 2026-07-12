// B"H
const fs = require('node:fs').promises;
const Cleanup = require('./processCleanup.js');
const Lifecycle = require('./lifecycle.js');

/** B"H — Apply mode mutates only the explicit decision produced by the planner. */
async function apply(record, decision, options = {}) {
	if (options.apply !== true) {
		return receipt(record, decision, true, { dryRun: true });
	}
	try {
		if (decision.action === 'remove_terminal') {
			await fs.rm(record.directory, { recursive: true, force: true });
			return receipt(record, decision, true, { removed: true });
		}
		if (decision.action === 'keep_terminal') {
			return receipt(record, decision, true, { kept: true });
		}
		if (decision.action === 'cleanup_exact') {
			return cleanupExact(record, decision, options);
		}
		if (decision.action === 'finalize') {
			const meta = await Lifecycle.finalizeDetached(
				record.rootConfig,
				record.jobId,
				record.meta,
				decision.patch
			);
			return receipt(record, decision, true, { meta });
		}
		return receipt(record, decision, true, { skipped: true });
	} catch (error) {
		return receipt(record, decision, false, { error: error.message });
	}
}

async function cleanupExact(record, decision, options) {
	const cleanup = await (options.cleanup || Cleanup.cleanup)(
		decision.expected,
		options.cleanupOptions || {}
	);
	const patch = {
		status: cleanup.ok ? 'cancelled' : cleanup.state,
		cancelled: cleanup.ok,
		startupRecovered: true,
		cleanup,
		processComparison: decision.processComparison
	};
	const meta = await Lifecycle.finalizeDetached(
		record.rootConfig,
		record.jobId,
		record.meta,
		patch
	);
	return receipt(record, decision, true, { cleanup, meta });
}

function receipt(record, decision, ok, extra = {}) {
	return {
		ok,
		jobId: record.jobId,
		stateRoot: record.stateRoot,
		action: decision.action,
		status: decision.status,
		...extra
	};
}

module.exports = { apply, cleanupExact, receipt };
