// B"H

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { FallbackConversationService } from "../relay/direct/chatgpt/FallbackConversationService.mjs";
import { WebsiteLoginCoordinator } from "../relay/direct/chatgpt/WebsiteLoginCoordinator.mjs";

const require = createRequire(import.meta.url);
const { loadConfig, normalizeAgentStartUrl, requireConfiguredAgentStartUrl,
	DEFAULT_AGENT_START_URL } = require("../relay/split-browser/config.cjs");

test("website mission config defaults to the named Awtsmoos Shliach", () => {
	const previous = process.env.AWTSMOOS_CHATGPT_AGENT_URL;
	delete process.env.AWTSMOOS_CHATGPT_AGENT_URL;
	try {
		assert.equal(loadConfig().agentStartUrl, DEFAULT_AGENT_START_URL);
		assert.throws(() => normalizeAgentStartUrl("https://chatgpt.com/"), /Awtsmoos Shliach/);
		assert.throws(
			() => normalizeAgentStartUrl("https://chatgpt.com/g/another-agent"),
			/Awtsmoos Shliach/
		);
		assert.throws(
			() => requireConfiguredAgentStartUrl("https://chatgpt.com/g/another-agent"),
			/Awtsmoos Shliach/
		);
	} finally {
		if (previous === undefined) delete process.env.AWTSMOOS_CHATGPT_AGENT_URL;
		else process.env.AWTSMOOS_CHATGPT_AGENT_URL = previous;
	}
});

test("website service supplies the named Shliach when callers omit a target", async () => {
	let received = null;
	const service = new FallbackConversationService({
		store: { set: () => "opaque-key", get: () => null },
		portResolver: { async resolve() { return 9223; } },
		clientFactory: () => ({
			async send(options) {
				received = options;
				return { answer: "B'H", state: {
					conversationId: "private", parentMessageId: "parent"
				}, status: 200, done: true };
			},
			async close() {}
		})
	});
	await service.send({ prompt: "test" });
	assert.equal(received.agentStartUrl, DEFAULT_AGENT_START_URL);
});

test("manual-login browser opens the named Shliach and reuses its profile", async () => {
	let launch = null;
	const coordinator = new WebsiteLoginCoordinator({
		configFactory: () => ({ targetOrigin: "https://chatgpt.com",
			agentStartUrl: DEFAULT_AGENT_START_URL }),
		openBrowser: async options => {
			launch = options;
			return { ok: true, debugPort: 9223 };
		},
		openLoginPage: async () => ({ ok: true }),
		sessionReader: async () => ({ ok: true, status: "logged_in" })
	});
	const result = await coordinator.openForLogin();
	assert.equal(launch.launchUrl, DEFAULT_AGENT_START_URL);
	assert.equal(result.visibleLoginPage, true);
	assert.equal(result.reusedProfile, true);
	assert.equal(result.authenticated, true);
});
