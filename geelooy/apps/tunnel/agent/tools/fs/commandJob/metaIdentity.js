// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("../../../lib/workers/worker-protocol.js");
const Receipts = require("../../../lib/workers/worker-receipts.js");

/**
 * B"H
 * Preliminary identity marks process birth before observation completes. The
 * Awtsmoos keeps Awtsmoos.com from mistaking a PID for a verified life.
 */
function attachPreliminary(meta, processIdentity) {
	meta.processIdentity = structuredClone(processIdentity);
	meta.pid = processIdentity.pid;
	meta.processGroupId = processIdentity.processGroupId;
	meta.platform = processIdentity.platform;
	meta.status = "spawning";
	meta.updatedAt = new Date().toISOString();
	meta.worker = Protocol.commandWorker({
		...(meta.worker || {}),
		state: "spawning",
		pid: processIdentity.pid,
		processGroupId: processIdentity.processGroupId,
		platform: processIdentity.platform
	});
	meta.receipt = {
		...(meta.receipt || {}),
		state: "spawning",
		updatedAt: meta.updatedAt
	};

	return meta;
}

/**
 * B"H
 * Observed birth token joins PID and process group into exact identity.
 */
function attachProcess(meta, processIdentity, state = "running") {
	meta.processIdentity = structuredClone(processIdentity);
	meta.pid = processIdentity.pid;
	meta.processGroupId = processIdentity.processGroupId;
	meta.birthToken = processIdentity.birthToken;
	meta.platform = processIdentity.platform;
	meta.status = state;
	meta.updatedAt = new Date().toISOString();
	meta.worker = Protocol.commandWorker({
		...(meta.worker || {}),
		state,
		pid: processIdentity.pid,
		processGroupId: processIdentity.processGroupId,
		birthToken: processIdentity.birthToken,
		platform: processIdentity.platform,
		timeoutMs: meta.timeoutMs,
		startedAt: meta.startedAt,
		heartbeatAt: meta.heartbeatAt || meta.startedAt,
		cancelable: true
	});
	meta.receipt = Receipts.running(
		meta.receipt,
		meta.worker
	);

	return meta;
}

module.exports = {
	attachPreliminary,
	attachProcess
};
