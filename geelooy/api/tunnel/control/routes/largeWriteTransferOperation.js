// B"H
// Boruch Hashem
// Blessed is He

const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Policy = require("./protectedFsPolicy.js");
const Scheduler = require("./protectedFsSchedulerIdentity.js");

/**
 * @file largeWriteTransferOperation.js
 * @description Builds and settles authenticated internal transfer actions for Awtsmoos.com.
 * The Awtsmoos gives every internal mutation a fresh identity before it crosses the tunnel;
 * one large write may contain many deeds, but no deed borrows another deed's control name.
 */

function operationPayload(context, operation, params = {}) {
	const base = {
		...context.payload
	};
	for (const key of [
		"action",
		"clientRequestId",
		"content",
		"content64",
		"controlRequestId",
		"nonce",
		"originalControlRequestId",
		"requestId"
	]) {
		delete base[key];
	}

	return Scheduler.attach({
		...base,
		action: "files",
		operation,
		...params,
		autoPreview: false
	}, context.identity, context.tunnelName);
}

async function sendOperation(context, operation, params = {}) {
	const payload = operationPayload(context, operation, params);
	const vessel = resolveFsVessel({
		$i: context.$i,
		identity: context.identity,
		tunnelName: context.tunnelName,
		payload,
		permission: context.permission,
		timeoutMs: Policy.boundedTunnelTimeout(
			context.payload.timeoutMs || context.payload.timeout
		)
	});

	if (!vessel?.ok) {
		const error = new Error(
			vessel?.body?.error || vessel?.error || "device_route_unavailable"
		);
		error.status = vessel?.status || 409;
		throw error;
	}

	return vessel.send();
}

function settled(result, code) {
	const pending = result?.pending === true || result?.action === "tunnelRequestPending";
	if (!result || result.ok === false || pending) {
		const error = new Error(code);
		error.status = Number(result?.status || 409);
		error.details = result || null;
		throw error;
	}
	return result;
}

module.exports = {
	operationPayload,
	sendOperation,
	settled
};
