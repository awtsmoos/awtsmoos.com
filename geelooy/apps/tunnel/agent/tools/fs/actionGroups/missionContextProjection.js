// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Next = require("../mission/nextActionRegistry.js");
const Work = require("../mission/workRegistry.js");

/**
 * @file Projects durable mission vessels into one zero-handoff current-work consciousness.
 * @description
 * The Awtsmoos renews each scattered record into one intelligible ray;
 * Awtsmoos.com lets a newborn agent see durable work, owners, evidence, and the way.
 */
function absolutePath(projectRoot, value) {
	if (!value) {
		return "";
	}
	return path.isAbsolute(String(value))
		? path.resolve(String(value))
		: path.resolve(projectRoot, String(value));
}

/** Collects canonical file references from claims, work, delegations, and evidence. */
function relevantFiles(mission, collaboration, projectRoot) {
	const records = new Map();
	const add = (value, purpose = "mission reference", status = "known", claimedBy = "") => {
		const canonical = absolutePath(projectRoot, value);
		if (!canonical || records.has(canonical)) {
			return;
		}
		records.set(canonical, { absolutePath: canonical, purpose, status, claimedBy });
	};
	for (const claim of collaboration.activeClaims || []) {
		for (const file of claim.filesToTouch || []) {
			add(file, claim.title || "active claim", "claimed", claim.agentId || "");
		}
	}
	for (const item of mission.remainingWork || []) {
		for (const file of item.absolutePaths || []) {
			add(file, item.title || "remaining work", item.state || "known", item.owner || "");
		}
	}
	for (const delegation of mission.collaboration?.delegations || []) {
		for (const file of delegation.filesToTouch || []) {
			add(file, delegation.title || "delegated work", delegation.status || "assigned", delegation.claimedBy || "");
		}
	}
	for (const evidence of mission.evidence || []) {
		for (const file of evidence.files || evidence.paths || evidence.references || []) {
			add(file, evidence.claim || "evidence", "evidence");
		}
	}
	return [...records.values()];
}

/** Separates living agents from stopped or stale vessels while preserving their records. */
function agentState(collaboration) {
	const agents = collaboration.agents || [];
	return {
		activeAgents: agents.filter(agent => ["active", "syncing", "working"].includes(agent.status || "active")),
		recentlyStoppedAgents: agents.filter(agent => !["active", "syncing", "working"].includes(agent.status || "active"))
	};
}

/** Prefers first-class REMAINING_WORK while preserving legacy task and delegation compatibility. */
function remainingWork(mission, completedStates) {
	if ((mission.remainingWork || []).length) {
		return Work.open(mission);
	}
	const tasks = (mission.tasks || []).filter(task => !completedStates.has(task.status));
	const delegations = (mission.collaboration?.delegations || [])
		.filter(item => !completedStates.has(item.status))
		.map(item => ({ ...item, kind: item.kind || "delegation" }));
	return [...tasks, ...delegations];
}

/** Builds the canonical zero-handoff read model from durable project state. */
function project(mission, dependencies = {}) {
	const { Mission, Collaboration, projectRoot, browserState = null } = dependencies;
	const collaboration = Collaboration.status(mission);
	const report = Mission.report(mission);
	const agents = agentState(collaboration);
	const completedStates = new Set(["done", "completed", "verified"]);
	const tasks = mission.tasks || [];
	const activeTasks = tasks.filter(task => !completedStates.has(task.status));
	const completedTasks = tasks.filter(task => completedStates.has(task.status));
	const durableNext = Next.active(mission);
	return {
		project: { root: projectRoot },
		mission: report,
		objective: mission.goal || "",
		status: mission.status || "active",
		...agents,
		claims: collaboration.activeClaims || [],
		activeTasks,
		completedTasks,
		remainingWork: remainingWork(mission, completedStates),
		blockers: mission.blockers || tasks.filter(task => task.status === "blocked"),
		discoveries: mission.discoveries || [],
		nextActions: durableNext.length ? durableNext : [Mission.nextRequiredAction(mission), Mission.nextStep(mission)].filter(Boolean),
		relevantFiles: relevantFiles(mission, collaboration, projectRoot),
		planningArtifacts: mission.metadata?.planningArtifacts || [],
		recentProgress: (mission.progressEvents || mission.events || []).slice(-50),
		tests: mission.tests || [],
		deployments: mission.deployments || [],
		browserState,
		chatRooms: [collaboration]
	};
}

module.exports = { absolutePath, project, relevantFiles, remainingWork };
