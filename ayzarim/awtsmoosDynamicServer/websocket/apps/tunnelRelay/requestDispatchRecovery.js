// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Legacy = require("./requestDispatchRecoveryLegacy.js");
const State = require("./state.js");
const Watchdog = require("./requestDispatchWatchdog.js");

/**
 * @file Reconciles unaccepted dispatch across socket generations without minting identity.
 * @description
 * The Awtsmoos keeps one deed while vessels reconnect. Awtsmoos.com observes the same
 * generation, but on a strictly newer registration durably advances the generation witness
 * before resending the exact stored envelope once. No new request or control ID is born.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THE NAMED REGRESSION
 * Historical symptom: old socket vanished after dispatch but before durable acceptance,
 * leaving the replacement child unable to receive the request. Root cause: recovery only
 * re-armed the timer. Identity: route key, canonical envelope/id, control ID, generation.
 * Forbidden simplification: same-generation resend or new request ID.
 * Regression: dispatchRestartSafety.test.cjs. Live proof: reconnect-before-accept chaos.
 */
function recoverPending(context, tunnel) {
	let recovered = 0;
	for (const [id, record] of context.pendingTunnelRequests || []) {
		if (!eligible(record, tunnel) || record.requestAcceptedAt) continue;
		if (record.dispatchStartedAt || record.dispatchedAt) {
			recoverPriorDispatch(context, id, record, tunnel);
		} else {
			Legacy.redispatch(context, id, record, tunnel, generation);
		}
		recovered += 1;
	}
	return recovered;
}

function recoverPriorDispatch(context, id, record, tunnel) {
	const currentGeneration = generation(tunnel.registrationGeneration);
	const priorGeneration = generation(record.dispatchRegistrationGeneration);
	if (!priorGeneration || currentGeneration <= priorGeneration) {
		watchPriorDispatch(context, id, record, tunnel);
		return false;
	}
	if (record.recoveryPromise) return false;
	const previousGeneration = priorGeneration;
	record.dispatchRegistrationGeneration = currentGeneration;
	record.recoveryPromise = commitAndRedeliver(context, id, record, tunnel, currentGeneration)
		.catch(() => {
			record.dispatchRegistrationGeneration = previousGeneration;
			return false;
		})
		.finally(() => {
			record.recoveryPromise = null;
		});
	return true;
}

async function commitAndRedeliver(context, id, record, tunnel, currentGeneration) {
	const committed = await State.rememberDispatched(context, id, record.expected, {
		dispatchedAt: new Date().toISOString(),
		registrationGeneration: currentGeneration
	});
	record.dispatchedAt = committed.dispatchedAt;
	record.dispatchStartedAt = Date.parse(committed.dispatchedAt);
	record.dispatchRegistrationGeneration = committed.dispatchRegistrationGeneration;
	if (!stillOwned(context, id, record, tunnel) || record.requestAcceptedAt) return false;
	tunnel.send(record.dispatchEnvelope);
	Watchdog.arm(context, id, record, tunnel);
	Activity.transition(context, record, "action.awaiting_acceptance", {
		state: "recovering",
		severity: "notice",
		summary: `${record.activityContext?.action || "action"} redelivered on newer registration`,
		phase: "registration_redelivery"
	});
	return true;
}

function watchPriorDispatch(context, id, record, tunnel) {
	Watchdog.arm(context, id, record, tunnel);
	Activity.transition(context, record, "action.awaiting_acceptance", {
		state: "recovering",
		severity: "notice",
		summary: `${record.activityContext?.action || "action"} awaits prior dispatch acceptance`,
		phase: "registration_reconciliation"
	});
}

function eligible(record, tunnel) {
	return record.registrationKey === tunnel.registrationKey &&
		!record.finalizationPromise && Boolean(record.dispatchEnvelope);
}

function stillOwned(context, id, record, tunnel) {
	return context.pendingTunnelRequests?.get(id) === record &&
		context.tunnels?.get?.(record.registrationKey) === tunnel;
}

function generation(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

module.exports = {
	commitAndRedeliver,
	eligible,
	generation,
	recoverPending,
	recoverPriorDispatch,
	stillOwned,
	watchPriorDispatch
};
