// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const { sendTunnelRequest } = require("../tunnelRelay/request.js");
const Scheduler = require("../../../../../geelooy/api/tunnel/control/routes/protectedFsSchedulerIdentity.js");
const Receipt = require("./nativeReceipt.js");

/**
 * @file Awtsmoos.com speaks native files through one durable relay deed.
 * The Awtsmoos chooses one true request and keeps its identity;
 * every pending reply is observed, never secretly dispatched again.
 */
async function send(server, identity, route, operation, params,
	relay = sendTunnelRequest) {
	const allowed = ["fileTransferSourceProof", "fileTransferUploadBinary",
		"fileTransferDownloadBinary"];
	if (!allowed.includes(operation)) throw Error("DEVICE_OPERATION_DENIED");
	if (!identity?.accountId || !route) throw Error("AUTH_REQUIRED");
	const payload = Scheduler.attach({
		action: "files",
		operation,
		...params,
		autoPreview: false,
		httpSafeWaitMs: 500,
		relayWaitMs: 500
	}, identity, route);
	const result = await Receipt.awaitNativeReceipt(relay, server,
		identity.accountId, route, payload);
	if (!result?.ok) throw Error("DEVICE_OPERATION_FAILED");
	return result;
}

module.exports = { send, unwrap: Receipt.result };
