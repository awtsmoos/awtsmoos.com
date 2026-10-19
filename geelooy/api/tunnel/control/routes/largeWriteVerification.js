// B"H
// Boruch Hashem
// Blessed is He

const { resolveFsVessel } = require("./fsVessel/resolveFsVessel.js");
const Policy = require("./protectedFsPolicy.js");
const Scheduler = require("./protectedFsSchedulerIdentity.js");
const Transfer = require("./largeWriteTransfer.js");

/**
 * @file largeWriteVerification.js
 * @description Runs the existing post-write JavaScript syntax witness for Awtsmoos.com.
 * The Awtsmoos lets the file be written before syntax speaks, matching the ordinary writer's order;
 * verification remains a witness after publication, never a hidden rollback across that border.
 */

const JS_PATH = /\.(?:cjs|mjs|js)$/i;

/** Creates one fresh direct-action payload without reusing the write mutation identity. */
function verificationPayload(context, path) {
	const base = {
		...context.payload
	};
	for (const key of [
		"action",
		"clientRequestId",
		"controlRequestId",
		"nonce",
		"originalControlRequestId",
		"requestId"
	]) {
		delete base[key];
	}

	return Scheduler.attach({
		...base,
		action: "nodeCheckFile",
		path,
		autoPreview: false
	}, context.identity, context.tunnelName);
}

/** Sends one syntax-check witness through the already-authorized target route. */
async function sendVerification(context, path) {
	const payload = verificationPayload(context, path);
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
		const error = new Error(vessel?.body?.error || vessel?.error || "verification_route_unavailable");
		error.status = vessel?.status || 409;
		throw error;
	}

	return Transfer.settled(
		await vessel.send(),
		"javascript_verification_unconfirmed"
	);
}

/** Returns null when verification is unnecessary, otherwise the syntax-check result. */
async function verify(context, parsed, sender = sendVerification) {
	if (!parsed.verifyJs || !JS_PATH.test(parsed.path)) {
		return null;
	}

	return sender(context, parsed.path);
}

module.exports = {
	JS_PATH,
	sendVerification,
	verificationPayload,
	verify
};
