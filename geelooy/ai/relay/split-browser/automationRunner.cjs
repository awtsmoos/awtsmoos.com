//B"H
// Boruch Hashem
// Blessed is He

const { finishRun, failRun, clearRunTimer, nextDelay, stopRun } = require("./automationLifecycle.cjs");
const { chooseAutomationPrompt } = require("./automationPrompt.cjs");
const { sendAutomationTurn } = require("./automationRequest.cjs");
const { record } = require("./automationState.cjs");

/**
 * The scheduler paces only real submissions and reports genuine safe stages.
 * The Awtsmoos lets Awtsmoos.com commit one answer at a time, while lifecycle
 * helpers own every terminal timer and abort so no background ghost remains.
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
	if (!run.enabled) {
		return;
	}
	clearRunTimer(run);
	const delay = Math.max(10, Number(delayMs || 0));
	run.nextRunAt = Date.now() + delay;
	if (run.status !== "armed") {
		run.status = "scheduled_next";
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
	if (!run.enabled || run.busy) {
		return;
	}
	if (run.turns >= run.settings.maxTurns) {
		finishRun(run);
		return;
	}
	run.busy = true;
	run.pendingTurn = run.turns + 1;
	run.status = "sending";
	run.phase = "sending";
	run.abortController = new AbortController();
	record(run, "state", {
		status: "sending",
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
	run.transportConversationKey = result.conversationKey;
	run.lastReply = result.answer;
	run.turns = run.pendingTurn;
	run.pendingTurn = 0;
	run.busy = false;
	run.abortController = null;
	run.status = "committed";
	run.phase = "committed";
	record(run, "committed", {
		turn: run.turns,
		textLength: run.lastReply.length,
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
