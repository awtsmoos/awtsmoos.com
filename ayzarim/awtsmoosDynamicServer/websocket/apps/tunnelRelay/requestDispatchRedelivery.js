// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Redelivers one canonical unaccepted request only into a strictly newer registration generation.
 * @description
 * The Awtsmoos preserves one deed, one transport ID, and one control identity across a severed line;
 * Awtsmoos.com lets durability follow that same sealed envelope without an unhandled promise crossing time.
 */
function canRedeliver(record = {}, tunnel = {}) {
	const envelope = record.dispatchEnvelope || {};
	const payload = envelope.payload || {};
	const priorGeneration = nonnegative(record.dispatchRegistrationGeneration);
	const currentGeneration = nonnegative(tunnel.registrationGeneration);
	return envelope.type === "TUNNEL_REQUEST" &&
		Boolean(String(envelope.id || "")) &&
		Boolean(String(payload.controlRequestId || "")) &&
		priorGeneration > 0 &&
		currentGeneration > priorGeneration;
}

/**
 * Sends the exact saved envelope and retains the durability promise as inspectable testimony.
 * @returns {boolean} True when one newer-generation redelivery was emitted.
 */
function redeliver(context, id, record, tunnel) {
	if (!canRedeliver(record, tunnel)) return false;
	try {
		tunnel.send(record.dispatchEnvelope);
	} catch {
		return false;
	}
	const generation = nonnegative(tunnel.registrationGeneration);
	record.dispatchRegistrationGeneration = generation;
	record.redeliveryCount = nonnegative(record.redeliveryCount) + 1;
	record.lastRedeliveredAt = new Date().toISOString();
	record.redeliveryPersistence = persist(context, id, record, generation);
	Watchdog.arm(context, id, record, tunnel);
	Activity.transition(context, record, "action.awaiting_acceptance", {
		state: "recovering",
		severity: "notice",
		summary: `${record.activityContext?.action || "action"} redelivered to newer registration`,
		phase: "registration_redelivery"
	});
	return true;
}

/** Converts asynchronous persistence failure into bounded record testimony instead of process rejection. */
async function persist(context, id, record, generation) {
	try {
		const committed = await State.rememberDispatched(context, id, record.expected, {
			dispatchedAt: record.lastRedeliveredAt,
			registrationGeneration: generation
		});
		record.redeliveryPersistenceError = "";
		return committed;
	} catch (error) {
		record.redeliveryPersistenceError = String(error?.message || error).slice(0, 240);
		return null;
	}
}

function nonnegative(value) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0;
}

module.exports = {
	canRedeliver,
	nonnegative,
	persist,
	redeliver
};
