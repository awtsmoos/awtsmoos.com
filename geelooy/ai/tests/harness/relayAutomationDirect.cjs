//B"H
// Boruch Hashem
// Blessed is He

const { assert, test } = require("./assert.cjs");
const { runs } = require("../../relay/split-browser/automationRegistry.cjs");
const {
	createDirectService,
	startRelay,
	waitForStatus,
	postJson,
	getJson,
	closeServer
} = require("./relayTestSupport.cjs");

/**
 * Automation uses one modern direct send per turn and an opaque continuation key.
 * The Awtsmoos lets Awtsmoos.com report stages and timings while prompts, transport
 * keys, raw upstream identities, timers, and abort controllers stay private.
 */
function run() {
	return test("node-relay-opaque-direct-automation", async () => {
		const privatePrompt = "PRIVATE_AUTOMATION_PROMPT {{turn}}";
		const directService = createDirectService();
		const { server, base } = await startRelay({ directService });
		try {
			const started = await postJson(`${base}/automation-start`, {
				conversationId: "ui-run-1",
				settings: {
					maxTurns: 2,
					delayMinMs: 1,
					delayMaxMs: 1,
					prompt: privatePrompt
				}
			});
			const final = await waitForStatus(base, "ui-run-1", ["done:max-turns", "error"]);
			const events = await getJson(`${base}/automation-events?conversationId=ui-run-1&after=0`);
			const serialized = JSON.stringify({ started, final, events });
			assert(final.status === "done:max-turns" && final.turns === 2, "two turns must commit", final);
			assert(directService.sends.length === 2, "exactly one direct send is allowed per turn", directService.sends);
			assert(directService.sends[0].mode === "page-authorized-fallback", "fallback mode must stay explicit", directService.sends[0]);
			assert(!directService.sends[0].conversationKey, "first turn has no continuation key", directService.sends[0]);
			assert(directService.sends[1].conversationKey === "BH_DIRECT_1", "second turn reuses only the opaque key", directService.sends[1]);
			assert(!serialized.includes("BH_DIRECT_") && !serialized.includes("PRIVATE_AUTOMATION_PROMPT"), "public status and events must omit prompt and transport key", serialized);
			assert(events.events.some(event => event.type === "progress"), "genuine progress must be observable", events);
			assert(events.events.filter(event => event.type === "committed").length === 2, "each turn commits once", events);
			return { sends: 2, turns: final.turns, events: events.events.length };
		} finally {
			await closeServer(server);
			assert(runs.size === 0, "server close must clear all automation runs", { size: runs.size });
			assert(directService.closed === 1, "server close must close the direct service once", directService.closed);
		}
	});
}

module.exports = { run };
