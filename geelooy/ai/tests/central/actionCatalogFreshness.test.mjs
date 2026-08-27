// B"H
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { GENERATED_TUNNEL_ACTIONS } from "../../central/generatedTunnelActions.js";

const require = createRequire(import.meta.url);
const { buildActions } = require(
	"../../../apps/tunnel/agent/tools/fs/actions.js"
);

const config = {
	root: process.cwd(),
	allowWrite: true,
	allowCommands: true,
	tools: {
		fsRead: true,
		fsWrite: true,
		fsBulk: true,
		command: true,
		chrome: true,
		browser: true
	}
};

const live = Object.keys(buildActions(config, { action: "list" }, null)).sort();
const generated = [...GENERATED_TUNNEL_ACTIONS]
	.filter(action => action !== "commandWait" || live.includes(action))
	.sort();

assert.deepEqual(
	generated,
	live,
	"generated tunnel actions must exactly match the native buildActions registry"
);

for (const required of [
	"agent",
	"aiAgentSpawnWebsiteMission",
	"websiteAgentMissionStart",
	"websiteAgentMissionList",
	"websiteAgentMissionStatus",
	"websiteAgentMissionMessage",
	"websiteAgentMissionStop",
	"websiteAgentMissionForget",
	"chatgptWebsiteLogout"
]) {
	assert.ok(generated.includes(required), `missing generated action: ${required}`);
}

console.log(JSON.stringify({
	ok: true,
	suite: "action-catalog-freshness",
	liveActions: live.length,
	generatedActions: generated.length,
	websiteMissionActionsDiscoverable: true
}, null, 2));
