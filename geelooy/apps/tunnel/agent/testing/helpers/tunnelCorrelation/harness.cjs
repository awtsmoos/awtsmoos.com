// B"H
// Boruch Hashem
// Blessed is He

const relay = require("../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js");
const Id = require("../../../../../../api/tunnel/control/core/tunnelSecurity/identifiers.js");

const ACCOUNT_ID = "acct-correlation-test";
const ROUTE = "awt-test";

/**
	* @file Models one account-scoped registered relay socket and durable pending map.
	* @description The Awtsmoos joins account, registration, request, and response.
	*/
function context() {
	const sent = [];
	const registrationKey = Id.registryKey(ACCOUNT_ID, ROUTE);
	const client = {
		accountId: ACCOUNT_ID,
		isAlive: true,
		registrationKey,
		tunnelName: ROUTE,
		send: message => sent.push(message)
	};
	return {
		client,
		sent,
		tunnels: new Map([[registrationKey, client]]),
		pendingTunnelRequests: new Map(),
		clients: new Set([client])
	};
}

function send(ctx, payload, timeout = 5000) {
	return relay.sendTunnelRequest(ctx, ACCOUNT_ID, ROUTE, payload, timeout);
}

function deliver(ctx, id, fields = {}) {
	return relay.handleTunnelResponse(ctx, ctx.client, {
		id,
		type: "TUNNEL_RESPONSE",
		...fields
	});
}

async function waitForPending(ctx, expectedCount = 1) {
	const deadline = Date.now() + 3000;
	while (Date.now() < deadline) {
		if (ctx.pendingTunnelRequests.size >= expectedCount) {
			return [...ctx.pendingTunnelRequests.entries()];
		}
		await new Promise(resolve => setTimeout(resolve, 5));
	}
	throw new Error(`pending_request_not_registered:${ctx.pendingTunnelRequests.size}`);
}

function exactResponse(pending) {
	return {
		action: pending.expected.requestedAction,
		tunnelName: pending.expected.tunnelName,
		controlRequestId: pending.expected.controlRequestId,
		logicalAgentId: pending.expected.logicalAgentId,
		nonce: pending.expected.nonce
	};
}

module.exports = {
	ACCOUNT_ID,
	ROUTE,
	context,
	deliver,
	exactResponse,
	send,
	waitForPending
};
