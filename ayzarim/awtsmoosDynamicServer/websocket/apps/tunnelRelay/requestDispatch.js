// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Envelopes = require("./envelopes.js");
const Lifecycle = require("./lifecycle.js");
const State = require("./state.js");

const DEFAULT_REQUEST_ACCEPTANCE_MS = Number(
	process.env.AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS || 15000
);

/**
 * @file Dispatches only after canonical durable reservation has succeeded.
 * @description
 * The Awtsmoos binds target, request, and response without mixture. Awtsmoos.com
 * persists missing-target truth, creates one pending waiter vessel, and sends one
 * socket message whose transport ID is the canonical control operation identity.
 */
async function missing(context, accountId, tunnelName, payload, plan, expected) {
	const data = Envelopes.missingTunnelEnvelope(expected);
	const record = {
		activityContext: Activity.describe(
			null,
			accountId,
			tunnelName,
			payload,
			plan.transportId
		)
	};
	await State.rememberCompleted(context, plan.transportId, data, expected);
	Activity.terminal(context, record, data, "action.failed");
	return data;
}

function dispatch(options = {}) {
	const {
		context,
		accountId,
		tunnelName,
		tunnel,
		payload,
		plan,
		expected,
		totalTimeoutMs,
		waitMs
	} = options;
	const record = Lifecycle.createRecord(
		context,
		plan.transportId,
		expected,
		totalTimeoutMs
	);
	record.registrationKey = tunnel.registrationKey;
	record.activityContext = Activity.describe(
		tunnel,
		accountId,
		tunnelName,
		payload,
		plan.transportId
	);
	Activity.queued(context, record);
	const waiting = Lifecycle.attachWaiter(record, waitMs);
	record.dispatchEnvelope = {
		type: "TUNNEL_REQUEST",
		id: plan.transportId,
		payload: {
			...plan.tunnelPayload,
			tunnelName,
			requestedTunnelName: tunnelName
		}
	};
	try {
		tunnel.send(record.dispatchEnvelope);
		armAcceptance(context, plan.transportId, record, tunnel);
		Activity.dispatched(context, record);
	} catch (error) {
		void Lifecycle.finishPending(
			context,
			plan.transportId,
			record,
			Envelopes.sendFailureEnvelope(plan.transportId, expected, error)
		);
	}
	return waiting;
}

function recoverPending(context, tunnel) {
	let recovered = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (record.registrationKey !== tunnel.registrationKey ||
			record.finalizationPromise ||
			record.requestAcceptedAt ||
			!record.dispatchEnvelope) {
			continue;
		}
		try {
			tunnel.send(record.dispatchEnvelope);
			record.requestAcceptedAt = 0;
			record.lastProgressAt = 0;
			armAcceptance(context, id, record, tunnel);
			Activity.transition(context, record, "action.redispatched", {
				state: "recovering",
				severity: "notice",
				summary: `${record.activityContext?.action || "action"} redispatched after reconnect`,
				phase: "registration_recovery"
			});
			recovered += 1;
		} catch {}
	}
	return recovered;
}

function armAcceptance(context, id, record, tunnel) {
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.consumerTimer = null;
	record.acceptanceTimer = setTimeout(() => {
		if (context.pendingTunnelRequests.get(id) !== record ||
			record.requestAcceptedAt) {
			return;
		}
		tunnel.connected = false;
		tunnel.isAlive = false;
		tunnel.lastTransportError = "device_request_acceptance_timeout";
		try {
			if (typeof tunnel.close === "function") {
				tunnel.close(4002, "device_request_acceptance_timeout");
			} else {
				tunnel.socket?.end?.();
			}
		} catch {}
	}, bounded(DEFAULT_REQUEST_ACCEPTANCE_MS));
	record.acceptanceTimer.unref?.();
}

function bounded(value) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1000, Math.min(120000, Math.floor(number)))
		: 15000;
}

module.exports = {
	DEFAULT_REQUEST_ACCEPTANCE_MS,
	armAcceptance,
	dispatch,
	missing,
	recoverPending
};
