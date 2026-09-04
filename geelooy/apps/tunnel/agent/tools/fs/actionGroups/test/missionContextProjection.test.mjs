// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Projection = require("../missionContextProjection.js");
const ContextActions = require("../missionContextActions.js");

/**
 * @file Proves one structured mission answer can replace giant handoff prose.
 * @description
 * The Awtsmoos joins agents, claims, files, and next deeds in one revealing light;
 * Awtsmoos.com gives each alias the same living graph so a new Shliach can act right.
 */
function main() {
	const projectRoot = "/tmp/awtsmoos-context-project";
	const mission = {
		id: "mission_context_projection",
		goal: "continue without a giant prompt",
		status: "active",
		tasks: [
			{ id: "task_open", title: "Open work", status: "active" },
			{ id: "task_done", title: "Verified work", status: "verified" }
		],
		collaboration: {
			delegations: [{ id: "delegation_open", title: "Delegated work", status: "claimed", filesToTouch: ["geelooy/delegated.js"] }]
		},
		evidence: [{ claim: "proof", files: ["geelooy/proof.js"] }],
		metadata: {
			planningArtifacts: [{ type: "plan", absolutePath: "/tmp/plan.md" }]
		},
		events: [{ type: "progress", at: "2026-09-04T00:00:00.000Z" }]
	};
	const collaboration = {
		agents: [
			{ agentId: "agent_live", status: "working" },
			{ agentId: "agent_stale", status: "stale" }
		],
		activeClaims: [{ agentId: "agent_live", title: "Claim", filesToTouch: ["geelooy/claimed.js"] }]
	};
	const Mission = {
		report: value => ({ id: value.id, status: value.status }),
		nextRequiredAction: () => ({ action: "missionStepExecute" }),
		nextStep: () => ({ step: 4 })
	};
	const Collaboration = { status: () => collaboration };
	const result = Projection.project(mission, { Mission, Collaboration, projectRoot });
	assert.equal(result.project.root, projectRoot);
	assert.deepEqual(result.activeAgents.map(agent => agent.agentId), ["agent_live"]);
	assert.deepEqual(result.recentlyStoppedAgents.map(agent => agent.agentId), ["agent_stale"]);
	assert.deepEqual(result.activeTasks.map(task => task.id), ["task_open"]);
	assert.deepEqual(result.completedTasks.map(task => task.id), ["task_done"]);
	assert.equal(result.remainingWork.length, 2);
	assert.equal(result.relevantFiles.every(file => path.isAbsolute(file.absolutePath)), true);
	assert.equal(result.relevantFiles.some(file => file.absolutePath === path.join(projectRoot, "geelooy/claimed.js")), true);
	const actions = ContextActions.buildMissionContextActions({
		config: {},
		payload: { cwd: process.cwd(), logicalAgentId: "fresh_agent" }
	});
	for (const alias of [
		"missionContext",
		"missionCurrentWork",
		"projectContext",
		"whatAreWeWorkingOn",
		"remainingWork",
		"nextWork",
		"missionProjectStatus",
		"missionProjectDiscover"
	]) {
		assert.equal(typeof actions[alias], "function");
	}
	console.log(JSON.stringify({ ok: true, suite: "mission-context-projection", aliases: Object.keys(actions) }));
}

main();
