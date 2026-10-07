// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Executes an explicitly synchronous tunnel command through the normal command law.
 * @description
 * The fast transport lane bypasses request queue latency, never command authorization,
 * scoped configuration, cwd bounds, admission policy, timeout law, or output accounting.
 */
function handleExecSync(dependencies, data = {}, webSocket) {
	const payload = data.payload || data;
	const id = String(data.id || "");
	const action = payload.action || "commandRun";
	void execute(dependencies, payload, id)
		.then(result => respond(dependencies, webSocket, payload, id, result))
		.catch(error => respond(dependencies, webSocket, payload, id, {
			ok: false,
			action,
			error: "sync_command_execution_failed",
			message: String(error?.message || error || "Unknown synchronous command failure")
		}));
	return true;
}

async function execute(dependencies, payload, id) {
	if (typeof dependencies.handleCommand !== "function") {
		throw new Error("command_handler_unavailable");
	}
	const result = await dependencies.handleCommand({
		...payload,
		action: payload.action || "commandRun",
		requestAction: payload.requestAction || payload.action || "commandRun",
		sync: true,
		inline: true,
		lean: true,
		noMission: true,
		controlRequestId: payload.controlRequestId || id
	});
	return {
		...(result && typeof result === "object"
			? result
			: { ok: false, error: "empty_command_response" }),
		syncExec: true
	};
}

function respond(dependencies, webSocket, payload, id, result) {
	const envelope = {
		type: "TUNNEL_RESPONSE",
		id
	};
	try {
		Object.assign(envelope, dependencies.Correlation.fields(payload));
	} catch {}
	Object.assign(envelope, result);
	dependencies.Send.safeSend(webSocket, envelope);
}

module.exports = {
	execute,
	handleExecSync,
	respond
};
