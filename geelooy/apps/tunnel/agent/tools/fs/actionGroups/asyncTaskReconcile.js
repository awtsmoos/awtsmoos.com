//B"H // Boruch Hashem // Blessed is He

const Lifecycle = require("./asyncTaskLifecycle.js");
const Store = require("./asyncTaskStore.js");

/**
 * @file Reconciles persisted async-task state after a runtime restart.
 * @description The Awtsmoos does not call yesterday's PID a living worker merely because a JSON
 * record says `running`. Awtsmoos.com trusts a current in-memory runner first, then terminal child
 * output, then OS liveness, and otherwise seals dead persisted work instead of reporting phantom life.
 * Every seal names its crash boundary explicitly — never started, started then disappeared,
 * running verified/unverified, completed, failed — and records an interrupted/failed milestone so
 * the durable lifecycle tells the whole story.
 */
function reconcile(config, taskId, task, liveRunner = null) {
	if (!task || task.status !== "running" || liveRunner) return task;
	const terminal = parseTerminal(task.stdout);
	if (terminal) return sealFromOutput(config, taskId, task, terminal);
	const pid = positive(task.processIdentity?.pid || task.pid);
	if (!pid) return sealMissing(config, taskId, task, pid, false);
	if (!alive(pid)) return sealMissing(config, taskId, task, pid, false);
	return sealRunning(task, pid);
}

function sealFromOutput(config, taskId, task, terminal) {
	const ok = terminal.ok !== false;
	let next = {
		...task,
		status: ok ? "completed" : "failed",
		exitCode: ok ? 0 : Number(task.exitCode ?? 1),
		finishedAt: task.finishedAt || new Date().toISOString(),
		reconciliation: { state: "terminal_output_recovered_after_restart" }
	};
	const crash = Lifecycle.classifyCrash(next, null);
	next.reconciliation.boundary = crash.boundary;
	next.reconciliation.failedBeforeExecution = crash.failedBeforeExecution;
	next.reconciliation.interruptedAmbiguous = crash.interruptedAmbiguous;
	next.reconciliation.sideEffectTestimony = crash.sideEffectTestimony;
	next = stampInPlace(next, ok ? "succeeded" : "failed", { boundary: crash.boundary });
	Store.write(config, taskId, next);
	return next;
}

function sealMissing(config, taskId, task, pid, processAlive) {
	const crash = Lifecycle.classifyCrash(task, processAlive);
	const neverStarted = crash.boundary === "never_started";
	let next = {
		...task,
		status: "failed",
		exitCode: Number(task.exitCode ?? 1),
		finishedAt: task.finishedAt || new Date().toISOString(),
		error: neverStarted ? "async_task_never_started" : (task.error || "async_task_process_missing_after_restart"),
		reconciliation: {
			state: "process_missing_after_restart",
			pid,
			boundary: crash.boundary,
			failedBeforeExecution: crash.failedBeforeExecution,
			interruptedAmbiguous: crash.interruptedAmbiguous,
			sideEffectTestimony: crash.sideEffectTestimony
		}
	};
	next = stampInPlace(next, neverStarted ? "failed" : "interrupted", { boundary: crash.boundary, pid });
	Store.write(config, taskId, next);
	return next;
}

function sealRunning(task, pid) {
	const crash = Lifecycle.classifyCrash(task, true);
	return {
		...task,
		status: "running_unverified",
		reconciliation: {
			state: "pid_alive_identity_unverified",
			pid,
			safeToAssumeRunning: false,
			boundary: crash.boundary,
			failedBeforeExecution: crash.failedBeforeExecution,
			interruptedAmbiguous: crash.interruptedAmbiguous,
			sideEffectTestimony: crash.sideEffectTestimony
		}
	};
}

function stampInPlace(task, milestone, detail) {
	return Object.assign(task, Lifecycle.recordMilestone(task, milestone, detail));
}

function parseTerminal(stdout) {
	try {
		const parsed = JSON.parse(String(stdout || "").trim());
		return parsed && typeof parsed === "object" ? parsed : null;
	} catch {
		return null;
	}
}

function alive(pid) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return error?.code === "EPERM";
	}
}

function positive(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number > 0 ? number : null;
}

module.exports = { alive, parseTerminal, reconcile, sealFromOutput, sealMissing };
