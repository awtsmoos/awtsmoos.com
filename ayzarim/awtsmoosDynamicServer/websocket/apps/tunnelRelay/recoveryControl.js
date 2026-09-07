// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Id = require(
	"../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);
const { ensureServerState } = require("../../platform/ServerState.js");

const CONTROL_TYPE = "TUNNEL_RECOVERY_CONTROL";
const RESULT_TYPE = "TUNNEL_RECOVERY_RESULT";
const CAPABILITY = "recoveryControlV1";

/**
 * @file Carries bounded recovery beside ordinary durable command custody.
 * @description
 * The Awtsmoos gives healing another road when the worker road is sealed;
 * Awtsmoos.com binds each waiter to one authenticated socket generation so stale vessels stay repealed.
 */
function sendTunnelRecoveryControl(server, accountId, routeReference, verb, payload = {}, timeoutMs = 10000) {
	const state = ensureServerState(server);
	const registrationKey = Id.registryKey(accountId, routeReference);
	if (!registrationKey) return Promise.resolve(failure("invalid_tunnel_identity"));
	const tunnel = state.tunnels.get(registrationKey);
	if (!tunnel) return Promise.resolve(failure("tunnel_not_found"));
	if (tunnel.capabilities?.[CAPABILITY] !== true) {
		return Promise.resolve(failure("recovery_control_not_supported"));
	}
	const id = `recovery_${crypto.randomUUID()}`;
	const waitMs = bounded(timeoutMs, 10000);
	const waiters = ensureWaiters(server);
	return new Promise(resolve => {
		const timer = setTimeout(() => {
			waiters.delete(id);
			resolve(failure("recovery_control_timeout"));
		}, waitMs);
		timer.unref?.();
		waiters.set(id, {
			client: tunnel,
			registrationGeneration: Number(tunnel.registrationGeneration || 0),
			resolve,
			timer,
			verb: clean(verb)
		});
		try {
			tunnel.send({
				type: CONTROL_TYPE,
				id,
				verb: clean(verb),
				payload: object(payload)
			});
		} catch (error) {
			finish(waiters, id, failure(String(error?.message || error)));
		}
	});
}

function handleTunnelRecoveryResult(server, client, data = {}) {
	if (data.type !== RESULT_TYPE) return false;
	const id = clean(data.id);
	const waiters = ensureWaiters(server);
	const waiter = waiters.get(id);
	if (!waiter) return false;
	const state = ensureServerState(server);
	const current = state.tunnels.get(client.registrationKey);
	if (current !== client || waiter.client !== client) return false;
	if (Number(client.registrationGeneration || 0) !== waiter.registrationGeneration) return false;
	finish(waiters, id, {
		...object(data),
		type: RESULT_TYPE,
		id,
		verb: clean(data.verb || waiter.verb)
	});
	return true;
}

function ensureWaiters(server) {
	if (!(server.pendingTunnelRecoveryControls instanceof Map)) {
		server.pendingTunnelRecoveryControls = new Map();
	}
	return server.pendingTunnelRecoveryControls;
}

function finish(waiters, id, result) {
	const waiter = waiters.get(id);
	if (!waiter) return false;
	waiters.delete(id);
	clearTimeout(waiter.timer);
	waiter.resolve(result);
	return true;
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1000, Math.min(30000, Math.floor(number))) : fallback;
}

function clean(value) {
	return String(value || "").trim().slice(0, 240);
}

function object(value) {
	return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function failure(error) {
	return { ok: false, error: clean(error) };
}

module.exports = {
	CAPABILITY,
	CONTROL_TYPE,
	RESULT_TYPE,
	bounded,
	handleTunnelRecoveryResult,
	sendTunnelRecoveryControl
};
