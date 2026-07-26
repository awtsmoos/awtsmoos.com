// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Binds one caller, scope, worker, and job into durable identity.
	* @description
	* The Awtsmoos keeps root and cwd beside action identity. Awtsmoos.com never
	* asks a later status request to guess where the original process was born.
	*/
function commandReceipt(input = {}) {
	const source = { ...(input.correlation || {}), ...input };
	const action = source.action || "commandStart";
	const executionAction = source.executionAction || source.actualAction || action;
	return clean({
		receiptId: source.receiptId,
		jobId: source.jobId,
		workerId: source.workerId,
		action,
		requestAction: source.requestAction || action,
		executionAction,
		actualAction: executionAction,
		projectRoot: source.projectRoot,
		cwd: source.cwd,
		missionId: source.missionId,
		roomId: source.roomId,
		agentSessionId: source.agentSessionId,
		logicalAgentId: source.logicalAgentId,
		conversationId: source.conversationId,
		conversationName: source.conversationName,
		leaseId: source.leaseId || source.agentLeaseId,
		controlRequestId: source.controlRequestId,
		clientRequestId: source.clientRequestId,
		nonce: source.nonce,
		traceId: source.traceId,
		state: source.state || "running",
		createdAt: source.createdAt || new Date().toISOString(),
		safeToReplay: source.safeToReplay === true
	});
}

function created(input = {}) {
	return commandReceipt({ ...input, state: input.state || "queued" });
}

function running(receipt = {}, worker = {}) {
	return update(receipt, {
		state: "running",
		workerId: worker.workerId || receipt.workerId,
		jobId: worker.jobId || receipt.jobId,
		pid: worker.pid,
		processGroupId: worker.processGroupId,
		birthToken: worker.birthToken,
		heartbeatAt: worker.heartbeatAt
	});
}

function update(receipt = {}, patch = {}) {
	return clean({ ...receipt, ...patch, updatedAt: patch.updatedAt || new Date().toISOString() });
}

function clean(object = {}) {
	return Object.fromEntries(Object.entries(object).filter(([, value]) => {
		return value !== undefined && value !== "";
	}));
}

module.exports = { clean, commandReceipt, created, running, update };
