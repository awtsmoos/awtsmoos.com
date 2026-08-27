// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ChatGptTargetSelector } from "./ChatGptTargetSelector.mjs";

const AGENT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("forceNewTarget never borrows an existing ChatGPT tab", async () => {
	let listed = 0;
	let created = 0;
	const selector = new ChatGptTargetSelector({
		port: 9226,
		agentStartUrl: AGENT_URL,
		discovery: {
			listTargets: async () => {
				listed += 1;
				return [{
					id: "existing",
					type: "page",
					url: AGENT_URL,
					webSocketDebuggerUrl: "ws://existing"
				}];
			}
		},
		fetcher: async (_url, options = {}) => {
			assert.equal(options.method, "PUT");
			created += 1;
			return {
				ok: true,
				json: async () => ({
					id: "owned",
					type: "page",
					url: "about:blank",
					webSocketDebuggerUrl: "ws://owned"
				})
			};
		}
	});
	const result = await selector.acquire({ forceNewTarget: true });
	assert.equal(listed, 0);
	assert.equal(created, 1);
	assert.equal(result.owned, true);
	assert.equal(result.source, "created-owned-turn");
	assert.equal(result.target.id, "owned");
});
