// B"H
// Boruch Hashem
// Blessed is He

const { cleanPathValue } = require("./expectation.js");

/**
	* @file Reads response identity without collapsing worker promotion into aliasing.
	* @description
	* The Awtsmoos keeps the caller action and execution action distinct.
	* Awtsmoos.com validates the actual worker while honoring approved aliases.
	*/
function actualActionOf(data = {}) {
	return String(
		data.executionAction ||
		data.servedByAction ||
		data.actualAction ||
		data.action ||
		""
	);
}

function actualJobId(data = {}) {
	return data.jobId || data.statusPayload?.jobId || data.waitPayload?.jobId ||
		data.stdoutPagePayload?.jobId || data.stderrPagePayload?.jobId ||
		data.stdout?.jobId || data.stderr?.jobId || "";
}

function actualStream(data = {}) {
	return data.stream || data.stdout?.stream || data.stderr?.stream || "";
}

function actualPaths(data = {}) {
	return [
		data.path,
		data.absolutePath,
		data.source,
		data.dest,
		data.file?.path,
		data.file?.absolutePath,
		data.result?.path,
		data.result?.absolutePath
	].map(cleanPathValue).filter(Boolean);
}

function actualIdentity(data = {}) {
	return {
		id: data.id || "",
		tunnelName: data.tunnelName || data.actualTunnelName || "",
		requestedTunnelName: data.requestedTunnelName || "",
		vessel: data.vessel || data.targetVessel || "",
		routeReason: data.routeReason || "",
		controlRequestId: data.controlRequestId || "",
		clientRequestId: data.clientRequestId || "",
		agentSessionId: data.agentSessionId || "",
		logicalAgentId: data.logicalAgentId || "",
		projectRoot: data.projectRoot || data.root || "",
		nonce: data.nonce || "",
		jobId: actualJobId(data),
		stream: actualStream(data),
		cwd: data.cwd || "",
		command: data.command || "",
		paths: actualPaths(data),
		action: data.action || "",
		requestAction: data.requestAction || "",
		executionAction: actualActionOf(data),
		actualAction: actualActionOf(data),
		actionPromoted: data.actionPromoted === true
	};
}

module.exports = {
	actualActionOf,
	actualIdentity,
	actualJobId,
	actualPaths,
	actualStream
};
