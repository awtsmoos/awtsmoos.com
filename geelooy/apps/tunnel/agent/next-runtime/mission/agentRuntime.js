// B"H
const Model = require("./agentModel.js");

/**
 * B"H — Each agent receives a durable room of its own: inbox, task, action,
 * lease, resources, checkpoint, and control revision. A painted button can now
 * become a real command instead of pointing at one global mission pulse.
 */
function applyControl(runtime, command, options = {}) {
	Model.assertRevision(runtime, options.expectedRevision);
	const desiredState = Model.stateForCommand(command, runtime.desiredState);
	return Model.revise(runtime, {
		desiredState: command === "one-turn" ? "paused" : desiredState,
		oneTurnCredits: command === "one-turn" ? runtime.oneTurnCredits + 1 : runtime.oneTurnCredits,
		lastControlReason: options.reason || command,
		lastControlActor: options.actor || "human"
	});
}

function beforeTurn(runtime, task = null) {
	if (runtime.desiredState === "stopped") return blocked(runtime, "stopped");
	if (runtime.desiredState === "draining") return blocked(runtime, "draining");
	if (runtime.desiredState === "paused" && runtime.oneTurnCredits < 1) return blocked(runtime, "paused");
	const oneTurn = runtime.desiredState === "paused";
	return {
		ok: true,
		runtime: Model.revise(runtime, {
			observedState: "running",
			currentTask: task || runtime.currentTask,
			startedTurns: runtime.startedTurns + 1,
			oneTurnCredits: oneTurn ? runtime.oneTurnCredits - 1 : runtime.oneTurnCredits,
			turnStartedAt: new Date().toISOString()
		}),
		oneTurn
	};
}

function afterTurn(runtime, result = {}) {
	const observedState = runtime.desiredState === "running"
		? "idle"
		: runtime.desiredState === "draining" ? "drained" : runtime.desiredState;
	return Model.revise(runtime, {
		observedState,
		currentAction: null,
		completedTurns: runtime.completedTurns + (result.ok === false ? 0 : 1),
		lastResultRef: result.resultRef || "",
		lastFailureRef: result.failureRef || "",
		turnFinishedAt: new Date().toISOString()
	});
}

function enqueue(runtime, message = {}) {
	const dedupeKey = String(message.dedupeKey || message.messageId || "");
	if (dedupeKey && runtime.inbox.some(item => item.dedupeKey === dedupeKey)) return runtime;
	return Model.revise(runtime, {
		inbox: [...runtime.inbox, { ...message, dedupeKey, enqueuedAt: new Date().toISOString() }]
	});
}

function checkpoint(runtime, input = {}) {
	const value = {
		checkpointId: Model.required(input.checkpointId, "missing_checkpoint_id"),
		missionId: runtime.missionId,
		logicalAgentId: runtime.logicalAgentId,
		agentSessionId: runtime.agentSessionId,
		currentTask: runtime.currentTask,
		currentAction: runtime.currentAction,
		openResources: [...runtime.resources],
		filesTouched: [...(input.filesTouched || [])],
		testsRun: [...(input.testsRun || [])],
		newRisks: [...(input.newRisks || [])],
		nextAction: input.nextAction || null,
		resumeToken: input.resumeToken || "",
		createdAt: new Date().toISOString()
	};
	return Model.revise(runtime, { lastCheckpoint: value });
}

function blocked(runtime, reason) {
	return { ok: false, reason, runtime: Model.revise(runtime, { observedState: reason }) };
}

module.exports = {
	afterTurn,
	applyControl,
	beforeTurn,
	checkpoint,
	createAgentRuntime: Model.create,
	enqueue
};
