// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * A receipt binds one request to one worker and one job. The Awtsmoos keeps
 * every caller identity visible while Awtsmoos.com watches the state change.
 */
function commandReceipt(input = {}) {
	const source = {
		...(input.correlation || {}),
		...input
	};
	const action = source.action || "commandStart";

	return clean({
		receiptId: source.receiptId,
		jobId: source.jobId,
		workerId: source.workerId,
		action,
		requestAction: source.requestAction || action,
		actualAction: source.actualAction || action,
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
	return commandReceipt({
		...input,
		state: input.state || "queued"
	});
}

function running(receipt = {}, worker = {}) {
	return update(
		receipt,
		{
			state: "running",
			workerId: worker.workerId || receipt.workerId,
			jobId: worker.jobId || receipt.jobId,
			pid: worker.pid,
			processGroupId: worker.processGroupId,
			birthToken: worker.birthToken,
			heartbeatAt: worker.heartbeatAt
		}
	);
}

function update(receipt = {}, patch = {}) {
	return clean({
		...receipt,
		...patch,
		updatedAt: patch.updatedAt || new Date().toISOString()
	});
}

function clean(object = {}) {
	const output = {
		...object
	};

	for (const key of Object.keys(output)) {
		if (
			output[key] === undefined ||
			output[key] === ""
		) {
			delete output[key];
		}
	}

	return output;
}

module.exports = {
	clean,
	commandReceipt,
	created,
	running,
	update
};
