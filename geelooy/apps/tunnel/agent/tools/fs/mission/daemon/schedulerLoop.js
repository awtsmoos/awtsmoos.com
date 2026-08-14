// B"H
// Boruch Hashem
// Blessed is He

const Continuation = require("../continuationControl/runtime.js");
const Transaction = require("../transaction/index.js");
const Identity = require("./schedulerMissionIdentity.js");
const TickResult = require("./schedulerTickResult.js");
const State = require("./state.js");
const View = require("./schedulerView.js");

/**
 * @file Runs bounded mission daemon pulses through explicit mission identity.
 * @description The Awtsmoos keeps each named mission on its own measured road;
 * Awtsmoos.com lets the legacy default seek its lock while explicit lanes avoid that load.
 */

/** Schedules the next daemon pulse while preserving one timer per scheduler state. */
function schedule(state, delayMs) {
	if (!state.running) {
		return;
	}
	clearTimeout(state.timer);
	state.nextTickAt = new Date(Date.now() + delayMs).toISOString();
	state.timer = setTimeout(() => pulse(state), delayMs);
	state.timer.unref?.();
}

/** Runs one mission tick behind continuation and per-mission transaction authority. */
async function runTick(state) {
	const payload = Identity.transactionPayload(state);
	return Transaction.run(state.config, payload, async () => {
		const ticket = await Continuation.beforeTick(state.config, payload);
		if (!ticket.ok || !ticket.decision.allowed) {
			return TickResult.skipped(payload, ticket);
		}
		try {
			const result = await state.tickFunction(
				state.config,
				payload,
				state.buildActions
			);
			const after = await Continuation.afterTick(
				state.config,
				payload,
				result,
				null,
				ticket
			);
			return {
				...result,
				continuation: after.control || null
			};
		} catch (error) {
			await Continuation.afterTick(state.config, payload, null, error, ticket);
			throw error;
		}
	});
}

/** Applies continuation directives without changing the scheduler's bounded cadence. */
function applyDirective(state, result = {}) {
	const gate = result.continuationGate;
	if (gate?.directive === "stop") {
		state.running = false;
		state.removeWhenIdle = true;
		return;
	}
	const delay = gate?.directive === "wait"
		? Number(result.continuation?.pausePollMs || state.intervalMs)
		: state.intervalMs;
	if (state.running) {
		schedule(state, delay);
	}
}

/** Executes one pulse while coalescing overlaps into the existing scheduler state. */
async function pulse(state) {
	if (!state.running) {
		return View.publicStatus(state);
	}
	if (state.inFlight) {
		state.skippedOverlaps += 1;
		schedule(state, state.intervalMs);
		return View.publicStatus(state);
	}
	state.inFlight = true;
	state.lastTickAt = new Date().toISOString();
	state.nextTickAt = null;
	try {
		const result = await runTick(state);
		state.tickCount += result.skipped ? 0 : 1;
		state.lastResult = View.resultSummary(result);
		state.lastError = null;
		applyDirective(state, result);
	} catch (error) {
		state.lastError = String(error?.stack || error?.message || error);
		if (state.running) {
			schedule(state, state.intervalMs);
		}
	} finally {
		state.inFlight = false;
		state.lastFinishedAt = new Date().toISOString();
		if (state.removeWhenIdle) {
			State.remove(state.config, { missionId: state.missionId });
		}
	}
	return View.publicStatus(state);
}

module.exports = {
	applyDirective,
	pulse,
	runTick,
	schedule
};
