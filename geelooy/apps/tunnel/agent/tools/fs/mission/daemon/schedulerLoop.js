// B"H

const Lock = require("../lock/index.js");
const Continuation = require("../continuationControl/runtime.js");
const Transaction = require("../transaction/index.js");
const State = require("./state.js");
const View = require("./schedulerView.js");

function schedule(state, delayMs) {
	if (!state.running) return;
	clearTimeout(state.timer);
	state.nextTickAt = new Date(Date.now() + delayMs).toISOString();
	state.timer = setTimeout(() => pulse(state), delayMs);
	state.timer.unref?.();
}

function transactionPayload(state) {
	const lock = Lock.active(state.config);
	return {
		...state.payload,
		action: "missionDaemonTick",
		missionId: state.missionId === "default"
			? lock?.missionId || state.payload.missionId || ""
			: state.missionId
	};
}

async function runTick(state) {
	const payload = transactionPayload(state);
	return Transaction.run(state.config, payload, async () => {
		const ticket = await Continuation.beforeTick(state.config, payload);
		if (!ticket.ok || !ticket.decision.allowed) {
			return {
				ok: ticket.ok !== false,
				action: "missionDaemonTick",
				missionId: payload.missionId,
				skipped: true,
				continuationGate: ticket.decision,
				continuation: ticket.control || null
			};
		}
		try {
			const result = await state.tickFunction(state.config, payload, state.buildActions);
			const after = await Continuation.afterTick(state.config, payload, result, null, ticket);
			return { ...result, continuation: after.control || null };
		} catch (error) {
			await Continuation.afterTick(state.config, payload, null, error, ticket);
			throw error;
		}
	});
}

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
	if (state.running) schedule(state, delay);
}

async function pulse(state) {
	if (!state.running) return View.publicStatus(state);
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
		if (state.running) schedule(state, state.intervalMs);
	} finally {
		state.inFlight = false;
		state.lastFinishedAt = new Date().toISOString();
		if (state.removeWhenIdle) State.remove(state.config, { missionId: state.missionId });
	}
	return View.publicStatus(state);
}

module.exports = { applyDirective, pulse, runTick, schedule, transactionPayload };
