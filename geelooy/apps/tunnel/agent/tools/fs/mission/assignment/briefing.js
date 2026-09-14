//B"H
//Boruch Hashem
//Blessed be He

const Collaboration = require("../collaboration.js");
const Work = require("../workRegistry.js");
const Paths = require("./paths.js");

const BASELINE_INSTRUCTION_IDS = Object.freeze([
	"mission.bootstrap",
	"mission.continuation",
	"mission.next-action-obligation",
	"execution.lightning-throughput",
	"execution.ready-work-conveyor",
	"execution.resource-aware-seven",
	"execution.accuracy-proof",
	"execution.control-plane-reserve"
]);

/**
 * @file Builds the small continuation capsule handed to a newly arrived agent session.
 * @description
 * The capsule carries durable mission truth, peer findings, absolute paths, and next work.
 * Baseline doctrine is named immediately while full instruction bodies stay lazily fetchable.
 */
function build(config, mission, input = {}) {
	const anchors = Paths.ensure(config, mission, input);
	const collaboration = Collaboration.status(mission);
	const openWork = Work.open(mission).slice(0, Number(input.workLimit || 20));
	const requestedWork = Object.prototype.hasOwnProperty.call(input, "workId");
	const requestedWorkId = String(input.workId || "");
	const active = requestedWork
		? openWork.find(item => item.id === requestedWorkId) || null
		: openWork[0] || null;
	return {
		missionId: mission.id,
		goal: mission.goal || "",
		status: mission.status || "active",
		projectRoot: anchors.projectRoot,
		absolutePaths: anchors.absolutePaths,
		workId: active?.id || "",
		currentWork: active,
		remainingWork: openWork,
		remainingCount: Work.open(mission).length,
		improvements: improvements(mission),
		peerAgents: peers(collaboration),
		peerFindings: findings(mission),
		blockers: mission.blockers || [],
		recentEvidence: (mission.evidence || []).slice(-12),
		recentProgress: (mission.progressEvents || mission.events || []).slice(-20),
		baselineInstructionIds: [...BASELINE_INSTRUCTION_IDS],
		instructionRequest: instructionRequest(mission, active, anchors),
		continuationRule: "Report evidence, execute the next safe action, and ask missionAgentNextWork again instead of waiting idly."
	};
}

/** Collects durable improvement/debt signals without inventing new completion claims. */
function improvements(mission) {
	const explicit = mission.improvements || mission.improvementBacklog || [];
	const work = (mission.remainingWork || []).filter(item => {
		const text = `${item.origin || ""} ${item.title || ""}`.toLowerCase();
		return /(improv|debt|performance|future|research|polish)/.test(text);
	});
	return [...explicit, ...work].slice(0, 20);
}

/** Returns living peer roles and current activity without binding the new chat to them. */
function peers(collaboration = {}) {
	return (collaboration.agents || []).slice(0, 20).map(agent => ({
		agentId: agent.agentId || agent.id || "",
		role: agent.role || "worker",
		status: agent.status || "unknown",
		currentAction: agent.currentAction || "",
		lastSeenAt: agent.lastSeenAt || ""
	}));
}

/** Preserves the latest peer brainstorm/messages/discoveries as compact shared context. */
function findings(mission) {
	const room = mission.room || {};
	const messages = (room.messages || []).slice(-8).map(message => ({
		from: message.fromAgent || message.agentId || "",
		text: message.text || message.message || "",
		at: message.at || message.createdAt || ""
	}));
	const brainstorms = (room.brainstorms || mission.brainstorms || []).slice(-5);
	const discoveries = (mission.discoveries || []).slice(-5);
	return { messages, brainstorms, discoveries };
}

/** Supplies resolver evidence while full doctrine remains a lazy Tunnel request. */
function instructionRequest(mission, work, anchors) {
	return {
		action: "instructionResolve",
		task: work?.description || work?.title || mission.goal || "Continue mission",
		paths: work?.absolutePaths?.length ? work.absolutePaths : anchors.absolutePaths,
		tags: ["mission", "continuation", work?.origin || "durable-work"].filter(Boolean)
	};
}

module.exports = {
	BASELINE_INSTRUCTION_IDS,
	build,
	findings,
	improvements,
	instructionRequest,
	peers
};
