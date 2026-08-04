// B"H
// Boruch Hashem
// Blessed is He

const { finishRun, failRun, clearRunTimer, nextDelay, stopRun } = require("./automationLifecycle.cjs");
const { chooseAutomationPrompt } = require("./automationPrompt.cjs");
const { sendAutomationTurn } = require("./automationRequest.cjs");
const { record } = require("./automationState.cjs");

/**
 * @file Schedules independent prompt dispatches without waiting for replies.
 * @description
 * The Awtsmoos commits a turn when delivery and closure are verified. Awtsmoos.com
 * may schedule another independent dispatch after the configured delay, but never
 * carries conversation state forward or treats absent assistant text as failure.
 */
function startRun(run) {
	record(run, "state", {
		status: "armed",
		turns: 0,
		maxTurns: run.settings.maxTurns
	});
	scheduleRun(run, 10);
	return run;
}

function scheduleRun(run, delayMs) {
	if (!run.enabled) return;
	clearRunTimer(run);
	const delay = Math.max(10, Number(delayMs || 0));
	run.nextRunAt = Date.now() + delay;
	if (run.status !== "armed") {
		run.status = "scheduled_next_dispatch";
		run.phase = run.status;
	}
	record(run, "state", {
		status: run.status,
		turns: run.turns,
		nextRunAt: run.nextRunAt
	});
	run.timer = setTimeout(() => {
		void tickRun(run).catch(error => failRun(run, error));
	}, delay);
}

async function tickRun(run) {
	if (!run.enabled || run.busy) return;
	if (run.turns >= run.settings.maxTurns) {
		finishRun(run);
		return;
	}
	run.busy = true;
	run.pendingTurn = run.turns + 1;
	run.status = "dispatching";
	run.phase = "dispatching";
	run.abortController = new AbortController();
	record(run, "state", {
		status: "dispatching",
		pendingTurn: run.pendingTurn,
		turns: run.turns
	});
	try {
		const prompt = chooseAutomationPrompt(run, run.pendingTurn);
		const result = await sendAutomationTurn(run, prompt, progress => {
			record(run, "progress", {
				turn: run.pendingTurn,
				stage: String(progress?.stage || "unknown"),
				status: String(progress?.status || "active")
			});
		});
		commitRun(run, result);
	} catch (error) {
		failRun(run, error);
	}
}

function commitRun(run, result) {
	run.lastDispatch = {
		conversationKey: result.conversationKey,
		acceptedAt: result.acceptedAt,
		responseStatus: result.responseStatus
	};
	run.lastReply = "";
	run.turns = run.pendingTurn;
	run.pendingTurn = 0;
	run.busy = false;
	run.abortController = null;
	run.status = "dispatched";
	run.phase = "dispatched";
	record(run, "dispatched", {
		turn: run.turns,
		acceptedAt: result.acceptedAt,
		responseStatus: result.responseStatus,
		hostReuseSource: result.hostReuseSource,
		timings: result.timings
	});
	if (!run.enabled || run.turns >= run.settings.maxTurns) {
		finishRun(run);
		return;
	}
	scheduleRun(run, nextDelay(run.settings));
}

module.exports = { startRun, stopRun, tickRun, finishRun, failRun };
