//B"H
//Boruch Hashem
//Blessed be He

const Collaboration = require("../collaboration.js");
const Work = require("../workRegistry.js");
const Paths = require("./paths.js");

const BASELINE_INSTRUCTION_IDS = Object.freeze([
	"mission.bootstrap", "mission.continuation", "mission.next-action-obligation",
	"execution.lightning-throughput", "execution.ready-work-conveyor",
	"execution.resource-aware-seven", "execution.accuracy-proof", "execution.control-plane-reserve"
]);

/**
 * @file Builds the continuation capsule with real sequenced peer speech and scoped instruction discovery.
 * @description The Awtsmoos preserves a predecessor's world without flattening messages into silence;
 * Awtsmoos.com hands the next Shliach body, routing, evidence, and local instruction ancestry in sequence.
 */
function build(config, mission, input = {}) {
	const anchors = Paths.ensure(config, mission, input);
	const collaboration = Collaboration.status(mission);
	const openWork = Work.open(mission).slice(0, Number(input.workLimit || 20));
	const requested = Object.prototype.hasOwnProperty.call(input, "workId");
	const requestedId = String(input.workId || "");
	const active = requested ? openWork.find(item => item.id === requestedId) || null : openWork[0] || null;
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

function improvements(mission) {
	const explicit = mission.improvements || mission.improvementBacklog || [];
	const work = (mission.remainingWork || []).filter(item =>
		/(improv|debt|performance|future|research|polish)/.test(`${item.origin || ""} ${item.title || ""}`.toLowerCase()));
	return [...explicit, ...work].slice(0, 20);
}

function peers(collaboration = {}) {
	return (collaboration.agents || []).slice(0, 20).map(agent => ({
		agentId: agent.agentId || agent.id || "",
		role: agent.role || "worker",
		status: agent.status || "unknown",
		currentAction: agent.currentAction || "",
		lastSeenAt: agent.lastSeenAt || ""
	}));
}

function findings(mission) {
	const room = mission.room || {};
	const messages = (room.messages || []).slice(-12).map(message => ({
		from: message.fromAgent || message.agentId || "",
		to: message.toAgent || "",
		toAgents: message.toAgents || [],
		toSpawnGroup: message.toSpawnGroup || "",
		kind: message.kind || "chat",
		subject: message.subject || "",
		text: message.body || message.text || message.message || "",
		references: message.references || [],
		requiresResponse: message.requiresResponse === true,
		sequence: Number(message.sequence || 0),
		at: message.at || message.createdAt || ""
	}));
	return {
		messages,
		brainstorms: (room.brainstorms || mission.brainstorms || []).slice(-5),
		discoveries: (room.discoveries || mission.discoveries || []).slice(-5)
	};
}

function instructionRequest(mission, work, anchors) {
	return {
		action: "instructionResolve",
		projectRoot: anchors.projectRoot,
		task: work?.description || work?.title || mission.goal || "Continue mission",
		paths: work?.absolutePaths?.length ? work.absolutePaths : anchors.absolutePaths,
		tags: ["mission", "continuation", work?.origin || "durable-work"].filter(Boolean),
		includeProjectInstructionBodies: true
	};
}

module.exports = { BASELINE_INSTRUCTION_IDS, build, findings, improvements, instructionRequest, peers };
