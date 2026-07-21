// B"H

const { handleFsAction } = require("./actions.js");
const Executor = require("./executor/index.js");

const SOCKET_ACTIONS = new Set(["configSet", "rootSelect"]);

/**
 * Keeps blocking filesystem and mission work outside the relay event loop.
 * Socket-mutating configuration remains local so re-registration uses the
 * exact acknowledged connection that received the request.
 */
async function handleFs(payload = {}, webSocket) {
	if (process.env.AWTSMOOS_FS_EXECUTOR_CHILD === "1") {
		return handleFsAction(payload, null);
	}
	if (SOCKET_ACTIONS.has(String(payload.action || ""))) {
		return handleFsAction(payload, webSocket);
	}
	return Executor.execute(payload);
}

module.exports = {
	SOCKET_ACTIONS,
	handleFs
};
