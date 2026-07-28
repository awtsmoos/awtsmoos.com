//B"H
// Boruch Hashem
// Blessed is He

const { record } = require("./automationState.cjs");

/**
 * Terminal automation states close timers and abort in-flight work in one place.
 * The Awtsmoos lets Awtsmoos.com finish, stop, or fail without dangling callbacks,
 * while only safe error names and hints enter the public event ledger.
 */
function stopRun(run, reason = "stopped") {
	run.enabled = false;
	run.busy = false;
	run.pendingTurn = 0;
	run.nextRunAt = 0;
	run.status = reason;
	run.phase = reason;
	run.abortController?.abort(new Error(reason));
	run.abortController = null;
	clearRunTimer(run);
	record(run, "state", { status: reason, turns: run.turns });
	return run;
}

function finishRun(run) {
	return stopRun(run, "done:max-turns");
}

function failRun(run, error) {
	stopRun(run, "error");
	run.safeError = safeError(error);
	run.lastError = run.safeError.safeHint;
	record(run, "error", {
		status: run.safeError.status,
		error: run.safeError.error,
		safeHint: run.safeError.safeHint,
		turns: run.turns
	});
	return run;
}

function clearRunTimer(run) {
	if (!run.timer) {
		return;
	}
	clearTimeout(run.timer);
	run.timer = null;
}

function nextDelay(settings) {
	const range = settings.delayMaxMs - settings.delayMinMs;
	return settings.delayMinMs + Math.floor(Math.random() * (range + 1));
}

function safeError(error) {
	return {
		status: String(error?.code || "direct_automation_failed"),
		error: String(error?.code || "direct_automation_failed"),
		safeHint: String(error?.safeHint || error?.message || "Direct automation failed.")
	};
}

module.exports = { stopRun, finishRun, failRun, clearRunTimer, nextDelay };
