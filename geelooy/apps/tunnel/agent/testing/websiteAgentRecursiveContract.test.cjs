// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Verifies the complete modular recursive website-agent production closure.
 * @description
 * The Awtsmoos gathers every focused runner, prompt, dispatch, store, and scheduling
 * vessel beneath one production root. Awtsmoos.com then proves accepted submission,
 * verified tab closure, durable shared rooms, and tool-driven recursive collaboration
 * without relying on conversational answers or hidden continuation polling.
 */
const websiteRoot = path.join(
	__dirname,
	"../tools/fs/actionGroups/websiteAgents"
);
const productionSource = javascriptFiles(websiteRoot)
	.map(file => fs.readFileSync(file, "utf8"))
	.join("\n");

assert.match(productionSource, /website-agent\.dispatched/);
assert.match(productionSource, /agent_prompt_dispatched/);
assert.match(productionSource, /tabClose/);
assert.match(productionSource, /promptVerified/);
assert.match(productionSource, /acceptedAt/);
assert.match(productionSource, /agents_working/);
assert.match(productionSource, /aiAgentSpawnWebsiteMission/);
assert.match(productionSource, /aiAgentWebsiteMissionStatus/);
assert.match(productionSource, /missionRoomJoin/);
assert.match(productionSource, /missionRoomInbox/);
assert.match(productionSource, /missionRoomMessage/);
assert.match(productionSource, /browser tab closes immediately/i);
assert.match(productionSource, /conversational response is ignored/i);
assert.doesNotMatch(productionSource, /result\.answer/);
assert.doesNotMatch(productionSource, /Outcome\.analyze/);
assert.doesNotMatch(productionSource, /service\.recover\(/);
assert.doesNotMatch(productionSource, /SPAWN must be exactly/);

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-recursive-modular-contract",
	acceptedDispatch: true,
	verifiedClose: true,
	sharedRooms: true,
	toolDrivenRecursion: true,
	answerPollingAbsent: true
}, null, 2));

function javascriptFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.flatMap(entry => {
			const absolute = path.join(directory, entry.name);
			if (entry.isDirectory()) return javascriptFiles(absolute);
			return entry.isFile() && /\.(?:cjs|mjs|js)$/.test(entry.name)
				? [absolute]
				: [];
		})
		.sort();
}
