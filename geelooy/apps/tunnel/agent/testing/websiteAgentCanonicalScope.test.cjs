// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Prompt = require("../tools/fs/actionGroups/websiteAgents/prompt.js");
const Identity = require("../tools/fs/actionGroups/websiteAgents/prompt/identity.js");
const Scopes = require("../tools/fs/actionGroups/websiteAgents/plannerScopes.js");

/**
 * @file Proves every website assignment carries one canonical bounded scope.
 * @description
 * The Awtsmoos gives each shliach a relative name and its absolute vessel.
 * Awtsmoos.com rejects escape beyond the root, repeats both names in the prompt,
 * and keeps one mission-session-round identity stable through accepted recovery.
 */
const projectRoot = "/Users/awtsmoos/work/awtsmoos.com";
const relativeScope = "geelooy/apps/tunnel";
const absoluteScope = `${projectRoot}/${relativeScope}`;

const plan = Planner.plan({ root: projectRoot }, {
	projectRoot,
	agentCount: 1,
	scopes: [relativeScope]
});

assert.equal(plan.projectRoot, projectRoot);
assert.equal(plan.agents[0].scope, relativeScope);
assert.equal(plan.agents[0].absoluteScope, absoluteScope);
assert.equal(Scopes.scopeDescriptor(projectRoot, "../escape"), null);
assert.equal(Scopes.scopeDescriptor(projectRoot, absoluteScope).absoluteScope, absoluteScope);

const agent = {
	...plan.agents[0],
	agentSessionId: "session-canonical-scope",
	pendingRound: 3,
	round: 2,
	status: "awaiting_recovery"
};
const record = {
	id: "website-canonical-scope",
	missionId: "mission-canonical-scope",
	goal: "Verify canonical assignment boundaries.",
	plan,
	agents: [agent]
};
const prompt = Prompt.firstTurn(record, agent, {
	agents: [],
	messages: [],
	activeClaims: [],
	openDelegations: []
});

assert.match(prompt, new RegExp(`Canonical project root:\\n${escape(projectRoot)}`));
assert.match(prompt, new RegExp(`Claimed relative scope:\\n${escape(relativeScope)}`));
assert.match(prompt, new RegExp(`Claimed absolute scope:\\n${escape(absoluteScope)}`));
assert.match(prompt, /Stable turn identity:\nwebsite:website-canonical-scope:session-canonical-scope:round-3/);
assert.equal(
	Identity.stableTurnIdentity(record, agent),
	"website:website-canonical-scope:session-canonical-scope:round-3"
);

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-canonical-scope",
	projectRoot,
	relativeScope,
	absoluteScope,
	turnIdentity: Identity.stableTurnIdentity(record, agent)
}, null, 2));

function escape(value) {
	return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
