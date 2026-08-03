// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { AgentTabCatalog } from "./AgentTabCatalog.mjs";

const AGENT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("catalog counts only configured Awtsmoos agent pages", async () => {
	const catalog = new AgentTabCatalog({
		agentStartUrl: AGENT_URL,
		portResolver: { resolve: async () => 9224 },
		fetcher: async () => ({
			ok: true,
			json: async () => [
				{ id: "root", type: "page", url: AGENT_URL },
				{ id: "conversation", type: "page", url: `${AGENT_URL}/c/abc` },
				{ id: "human", type: "page", url: "https://chatgpt.com/" },
				{ id: "game", type: "page", url: "https://example.com/game" },
				{ id: "worker", type: "service_worker", url: AGENT_URL }
			]
		})
	});
	const snapshot = await catalog.snapshot();
	assert.equal(snapshot.port, 9224);
	assert.equal(snapshot.total, 2);
	assert.deepEqual(snapshot.rootTabs.map(item => item.id), ["root"]);
	assert.deepEqual(snapshot.conversationTabs.map(item => item.id), ["conversation"]);
});
