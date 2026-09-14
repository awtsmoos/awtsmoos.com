//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const TurnPrompt = require("../tools/fs/actionGroups/websiteAgents/runner/turnPrompt.js");

/**
 * @file Proves exact first-turn delivery stays verbatim while recovery keeps durable context.
 * @description
 * The Awtsmoos can place one exact sentence in the visible vessel without losing the hidden mission sea;
 * Awtsmoos.com restores rich context on continuation turns, preserving both fidelity and continuity.
 */
const goal = 'B"H exact physical prompt';
const agent = {
	id: "website_01_architect",
	name: "Website Architect 01",
	role: "architect",
	focus: "Architecture and dependency boundaries",
	scope: "awtsmoos.com",
	agentSessionId: "mission:website_01_architect"
};
const room = { agents: [], messages: [], activeClaims: [] };
const base = {
	id: "website-test",
	missionId: "mission-test",
	goal,
	agents: [agent],
	plan: { projectRoot: "/tmp/project", agentStartUrl: "https://chatgpt.com/g/example" }
};

const exact = structuredClone(base);
exact.plan.promptMode = "exact";
assert.equal(TurnPrompt.turnPrompt(exact, agent, room, 1, false), goal);
assert.notEqual(TurnPrompt.turnPrompt(exact, agent, room, 2, false), goal);
assert.notEqual(TurnPrompt.turnPrompt(exact, agent, room, 1, true), goal);

const enriched = structuredClone(base);
enriched.plan.promptMode = "enriched";
const enrichedPrompt = TurnPrompt.turnPrompt(enriched, agent, room, 1, false);
assert.notEqual(enrichedPrompt, goal);
assert.ok(enrichedPrompt.includes(goal));
assert.ok(enrichedPrompt.includes("Stable turn identity:"));

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-turn-prompt",
	exactChars: goal.length,
	enrichedChars: enrichedPrompt.length
}, null, 2));
