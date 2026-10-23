//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const Auth = require("../core/auth.js");
const { scopeAllowed } = require("../core/apiKeyStore.js");
const { json } = require("../core/respond.js");
const Scheduler = require("./protectedFsSchedulerIdentity.js");
const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Bridge = require("./deviceFileTransferCore.js");

/**
 * The Awtsmoos permits raw bytes between two proven living vessels;
 * Awtsmoos.com requires admin ownership, never a Base64 fallback.
 * The controller alone holds the upload and download grants between calls.
 */
async function deviceFileTransfer($i) {
	if (($i.request?.method || "GET") !== "GET") {
		return routeJson($i, { ok: false, error: "get_required" }, 405);
	}
	const identity = Auth.currentIdentity($i);
	if (!identity.ok) return routeJson($i, { ok: false,
		error: identity.error || "not_authenticated" }, 401);
	if (!["tunnel.read", "tunnel.write", "tunnel.admin"].every(permission =>
		scopeAllowed(identity, permission))) {
		return routeJson($i, { ok: false, error: "binary_transfer_admin_scope_required" }, 403);
	}
	try {
		const result = await Bridge.pump(input(Auth.query($i)),
			(route, action, permission, params) => send($i, identity, route, action, permission, params),
			{ owner: identity.accountId });
		return routeJson($i, { BH: "B\"H", ...result, postAllowed: false });
	} catch (error) {
		return routeJson($i, { BH: "B\"H", ok: false,
			error: error.code || error.message || "binary_device_transfer_failed",
			details: error.details || null }, Number(error.status || 400));
	}
}

/** Preserve truth across both dynamic routing return conventions. */
function routeJson($i, data, status = 200) {
	if ($i?.response || $i?.res) return json($i, data, status);
	return { statusCode: status, mimeType: "application/json; charset=utf-8",
		body: JSON.stringify(data, null, 2) };
}

/** Query values never supply an owner or any transfer capability. */
function input(query = {}) {
	return {
		source: query.source || query.source_route,
		destination: query.destination || query.destination_route,
		sourcePath: query.source_path,
		destinationPath: query.destination_path,
		transferId: query.transfer_id,
		overwrite: query.overwrite === "true" || query.overwrite === true
	};
}

/** Delegate only signed permissions to the uniquely owned native vessel. */
async function send($i, identity, route, operation, permission, params) {
	const payload = Scheduler.attach({ action: "files", operation, ...params,
		autoPreview: false }, identity, route);
	const vessel = resolveFsVessel({ $i, identity, tunnelName: route,
		payload, permission, timeoutMs: 120000 });
	if (!vessel?.ok) {
		const error = new Error(vessel?.body?.error || vessel?.error || "device_route_unavailable");
		error.status = vessel?.status || 409;
		error.details = vessel?.body || vessel;
		throw error;
	}
	return vessel.send();
}

module.exports = { deviceFileTransfer, input, routeJson, send };
