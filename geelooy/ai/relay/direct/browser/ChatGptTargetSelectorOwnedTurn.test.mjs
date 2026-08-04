// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { ChatGptTargetSelector } from "./ChatGptTargetSelector.mjs";

const AGENT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

test("forceNewTarget creates the owned target directly at the custom GPT URL", async () => {
	let listed = 0;
	let createdUrl = null;
	const selector = new ChatGptTargetSelector({
		port: 9224,
		agentStartUrl: AGENT_URL,
		discovery: {
			listTargets: async () => {
				listed += 1;
				return [];
			}
		},
		fetcher: async (url, options = {}) => {
			createdUrl = url;
			assert.equal(options.method, "PUT");
			return {
				ok: true,
				json: async () => ({
					id: "owned",
					type: "page",
					url: AGENT_URL,
					webSocketDebuggerUrl: "ws://owned"
				})
			};
		}
	});
	const result = await selector.acquire({ forceNewTarget: true });
	assert.equal(listed, 0);
	assert.match(createdUrl, new RegExp(`/json/new\\?${encodeURIComponent(AGENT_URL)}`));
	assert.equal(createdUrl.includes(encodeURIComponent("about:blank")), false);
	assert.equal(result.owned, true);
	assert.equal(result.source, "created-owned-final-url");
	assert.equal(result.target.url, AGENT_URL);
});
