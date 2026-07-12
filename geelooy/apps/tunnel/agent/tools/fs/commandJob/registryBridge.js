// B"H
const Correlation = require('../../../lib/runtime/correlation.js');

/** B"H — Registry records preserve process-family identity without exposing command text. */
function registryRecord(meta = {}) {
	const correlation = Correlation.extract(meta.correlation || meta);
	return {
		workerId: meta.workerId,
		jobId: meta.jobId,
		receiptId: meta.receiptId,
		action: meta.receipt?.requestAction || 'commandRun',
		kind: 'subprocess',
		state: meta.status || 'running',
		pid: meta.processIdentity?.pid || meta.pid || null,
		processGroupId: meta.processIdentity?.processGroupId || meta.processGroupId || null,
		birthToken: meta.processIdentity?.birthToken || meta.birthToken || '',
		platform: meta.processIdentity?.platform || meta.platform || process.platform,
		startedAt: meta.startedAt,
		heartbeatAt: meta.heartbeatAt || meta.startedAt,
		cancelable: true,
		...correlation
	};
}

function finishRegistry(registry, meta = {}) {
	if (!registry || !meta.workerId) return;
	registry.finishWorker(meta.workerId, {
		state: meta.status,
		finishedAt: meta.finishedAt || new Date().toISOString(),
		exitCode: meta.exitCode,
		signal: meta.signal,
		cleanup: meta.cleanup || null,
		heartbeatAt: meta.heartbeatAt || meta.updatedAt || meta.finishedAt
	});
}

module.exports = { finishRegistry, registryRecord };
