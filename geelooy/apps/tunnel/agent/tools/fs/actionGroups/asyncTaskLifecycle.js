//B"H // Boruch Hashem // Blessed is He

/**
 * @file Records durable async-task lifecycle milestones and classifies crash boundaries.
 * @description The Awtsmoos distinguishes a deed that never began from one that began and
 * vanished. Awtsmoos.com persists created/accepted/started/heartbeat/succeeded/failed/
 * interrupted milestones on every async task, classifies every crash boundary explicitly —
 * never started (failed before execution), started then disappeared (interrupted/ambiguous) —
 * and carries side-effect testimony so reconciliation never guesses what the task touched.
 */

const MILESTONES = [
	"created",
	"accepted",
	"started",
	"heartbeat",
	"succeeded",
	"failed",
	"interrupted"
];

const CRASH_BOUNDARIES = [
	"never_started",
	"started_then_disappeared",
	"running_verified",
	"running_unverified",
	"completed",
	"failed"
];

/**
 * Appends one durable lifecycle milestone to the task. Pure: returns the updated task.
 * Milestones are evidence; the store persists the returned task.
 */
function recordMilestone(task = {}, milestone, detail) {
	if (!MILESTONES.includes(milestone)) {
		throw new Error(`unknown_lifecycle_milestone: ${milestone}`);
	}
	const entry = {
		milestone,
		at: new Date().toISOString(),
		detail: detail === undefined ? null : detail
	};
	const lifecycle = Array.isArray(task.lifecycle) ? [...task.lifecycle, entry] : [entry];
	const timestamps = milestoneTimestamps(task, milestone, entry.at);
	return { ...task, lifecycle, ...timestamps };
}

function milestoneTimestamps(task, milestone, at) {
	switch (milestone) {
		case "created":
		case "accepted":
			return task.acceptedAt ? {} : { acceptedAt: at };
		case "started":
			return task.startedAt ? {} : { startedAt: at };
		case "succeeded":
		case "failed":
			return task.completedAt ? {} : { completedAt: at };
		default:
			return {};
	}
}

/**
 * Classifies the crash boundary of one persisted task. processAlive is the reconciler's
 * verdict on the recorded PID (true/false/null when unverifiable). Never guesses:
 * ambiguous states are named ambiguous.
 */
function classifyCrash(task = {}, processAlive = null) {
	const terminal = terminalOf(task);
	if (terminal) {
		return {
			boundary: terminal === "succeeded" ? "completed" : "failed",
			failedBeforeExecution: false,
			interruptedAmbiguous: false,
			sideEffectTestimony: sideEffectsOf(task)
		};
	}
	if (!task.startedAt && !task.pid) {
		return {
			boundary: "never_started",
			failedBeforeExecution: true,
			interruptedAmbiguous: false,
			sideEffectTestimony: sideEffectsOf(task)
		};
	}
	if (processAlive === true) {
		return {
			boundary: task.processIdentityVerified === true ? "running_verified" : "running_unverified",
			failedBeforeExecution: false,
			interruptedAmbiguous: false,
			sideEffectTestimony: sideEffectsOf(task)
		};
	}
	return {
		boundary: "started_then_disappeared",
		failedBeforeExecution: false,
		interruptedAmbiguous: true,
		sideEffectTestimony: sideEffectsOf(task)
	};
}

function terminalOf(task) {
	const status = String(task.status || "").toLowerCase();
	if (status === "succeeded" || status === "completed") return "succeeded";
	if (status === "failed") return "failed";
	if (task.completedAt || task.exitCode !== undefined || task.signal || task.error) return "failed";
	return null;
}

/**
 * Collects side-effect testimony: what the task demonstrably touched. Reads explicit
 * sideEffects first, then falls back to structured evidence (written paths, stdout tail).
 */
function sideEffectsOf(task = {}) {
	if (Array.isArray(task.sideEffects)) {
		return task.sideEffects.filter(item => item && typeof item === "object");
	}
	const effects = [];
	if (Array.isArray(task.writtenPaths)) {
		for (const target of task.writtenPaths) {
			effects.push({ kind: "file_written", target: String(target) });
		}
	}
	if (task.command) {
		effects.push({ kind: "command_executed", target: String(task.command).slice(0, 300) });
	}
	return effects;
}

/**
 * Summarizes one task's durable lifecycle for reconciliation responses.
 */
function summarize(task = {}) {
	const lifecycle = Array.isArray(task.lifecycle) ? task.lifecycle : [];
	const milestones = lifecycle.map(entry => entry.milestone);
	return {
		taskId: task.taskId || task.id || "",
		status: task.status || "unknown",
		milestones,
		milestoneCount: lifecycle.length,
		lastMilestone: lifecycle.length ? lifecycle[lifecycle.length - 1] : null,
		startedAt: task.startedAt || null,
		completedAt: task.completedAt || null,
		sideEffectTestimony: sideEffectsOf(task)
	};
}

module.exports = {
	CRASH_BOUNDARIES,
	MILESTONES,
	classifyCrash,
	recordMilestone,
	sideEffectsOf,
	summarize,
	terminalOf
};
