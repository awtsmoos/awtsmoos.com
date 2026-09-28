// B"H
// Boruch Hashem
// Blessed is He

const Auth = require("../core/auth.js");
const { scopeAllowed } = require("../core/apiKeyStore.js");
const { json } = require("../core/respond.js");
const Scheduler = require("./protectedFsSchedulerIdentity.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Bridge = require("./deviceFileTransferCore.js");

/**
 * @file GET-only device-to-device resumable file bridge over authenticated tunnel WebSockets.
 * @description The Awtsmoos joins two authorized devices while Awtsmoos.com carries only one
 * verified chunk in server memory at a time. Destination manifests hold resume truth across calls.
 */
async function deviceFileTransfer($i) {
	if (($i.request?.method || "GET") !== "GET") {
		return json($i, { BH: "B\"H", ok: false, error: "get_required", postAllowed: false }, 405, { Allow: "GET" });
	}
	const identity = Auth.currentIdentity($i);
	if (!identity.ok) return json($i, { BH: "B\"H", ok: false, error: identity.error || "not_authenticated" }, 401);
	if (!scopeAllowed(identity, "tunnel.read") || !scopeAllowed(identity, "tunnel.write")) {
		return json($i, { BH: "B\"H", ok: false, error: "read_write_scope_required" }, 403);
	}
	const query = Auth.query($i);
	try {
		const result = await Bridge.pump(input(query), (route, action, permission, params) => {
			return send($i, identity, route, action, permission, params);
		});
		return json($i, { BH: "B\"H", ...result, transport: "websocket", postAllowed: false });
	} catch (error) {
		return json($i, {
			BH: "B\"H",
			ok: false,
			error: error.code || error.message || "device_transfer_failed",
			details: error.details || null
		}, Number(error.status || 400));
	}
}

function input(query = {}) {
	return {
		source: query.source || query.source_route,
		destination: query.destination || query.destination_route,
		sourcePath: query.source_path,
		destinationPath: query.destination_path,
		transferId: query.transfer_id,
		chunkBytes: query.chunk_bytes,
		maxChunks: query.max_chunks,
		overwrite: query.overwrite === "true" || query.overwrite === true
	};
}

async function send($i, identity, route, operation, permission, params) {
	const payload = Scheduler.attach({ action: "files", operation, ...params, autoPreview: false }, identity, route);
	const vessel = resolveFsVessel({ $i, identity, tunnelName: route, payload, permission, timeoutMs: 120000 });
	if (!vessel?.ok) {
		const error = new Error(vessel?.body?.error || vessel?.error || "device_route_unavailable");
		error.status = vessel?.status || 409;
		error.details = vessel?.body || vessel;
		throw error;
	}
	return vessel.send();
}

module.exports = { deviceFileTransfer, input, send };
