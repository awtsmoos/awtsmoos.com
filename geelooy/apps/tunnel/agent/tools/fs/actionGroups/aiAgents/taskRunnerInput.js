// B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../../../../lib/config.js");
const { taskLimits } = require("./taskLimits.js");
const Lease = require("./taskLease.js");

/**
 * @file Normalizes public delegate payloads and reconstructs task-scoped recovery config.
 * @description
 * The Awtsmoos carries each task's project and tunnel identity through rebirth.
 * Awtsmoos.com stores bounded durability settings beside the task that must honor them.
 */
const KNOWN_TASK_KINDS = new Set(["genericTask", "agentMessage", "novelOrchestra"]);

function normalize(config, payload = {}) {
	const limits = taskLimits(config, payload);
	const durability = Lease.policy(config, payload);
	return {
		kind: taskKind(payload),
		title: payload.title || "Delegated AI task",
		agentId: payload.agentId || payload.agent || "minimax-deep",
		summaryAgentId: payload.summaryAgentId,
		provider: payload.provider || "minimax",
		model: payload.model,
		prompt: payload.prompt || payload.message,
		messages: payload.messages,
		system: payload.system,
		outputDir: payload.outputDir,
		fileName: payload.fileName,
		summaryFileName: payload.summaryFileName,
		stream: payload.stream !== false,
		parentTaskId: payload.parentTaskId || null,
		rootTaskId: payload.rootTaskId || payload.taskId || null,
		depth: taskDepth(payload),
		projectRoot: payload.projectRoot || config.root || "",
		tunnelName: payload.tunnelName || config.tunnelName || "",
		logicalAgentId: payload.logicalAgentId || "",
		taskNamespace: payload.taskNamespace || payload.agentTaskNamespace || "",
		...limits,
		taskLeaseMs: durability.leaseMs,
		taskHeartbeatMs: durability.heartbeatMs,
		taskMaxAttempts: durability.maxAttempts
	};
}

function recoveryConfig(task) {
	const config = loadConfig();
	return {
		...config,
		root: task.input?.projectRoot || config.root,
		tunnelName: task.input?.tunnelName || config.tunnelName
	};
}

function taskKind(payload = {}) {
	const chosen = payload.taskKind || payload.aiTaskKind || payload.kind;
	return KNOWN_TASK_KINDS.has(chosen) ? chosen : "genericTask";
}

function taskDepth(payload = {}) {
	if (!payload.parentTaskId && !payload.rootTaskId && !payload.taskId) {
		return Number(payload.taskDepth || payload.aiDepth || 0);
	}
	return Number(payload.taskDepth ?? payload.aiDepth ?? payload.depth ?? 0);
}

module.exports = { normalize, recoveryConfig };
