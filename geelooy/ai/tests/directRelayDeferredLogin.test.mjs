// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";
import { FallbackConversationService } from "../relay/direct/chatgpt/FallbackConversationService.mjs";
import { WebsiteLoginCoordinator } from "../relay/direct/chatgpt/WebsiteLoginCoordinator.mjs";

test("deferred login opens once and never retries a POST", async () => {
	let sends = 0;
	let opens = 0;
	const service = new DirectService({
		websiteService: {
			async send() { sends += 1; throw new Error("ChatGPT is not authenticated."); },
			async close() {},
			status() { return {}; }
		},
		portResolver: { invalidate() {} },
		capabilityService: { invalidate() {} },
		loginCoordinator: {
			shouldAuthenticate: () => true,
			async openForLogin() {
				opens += 1;
				return { ok: true, opened: true, authenticated: false };
			}
		}
	});
	await assert.rejects(
		() => service.send({ prompt: "mission", loginPolicy: "defer" }),
		error => error.code === "chatgpt_login_pending"
	);
	assert.equal(sends, 1);
	assert.equal(opens, 1);
});

test("login coordinator reports only redacted state", async () => {
	const coordinator = new WebsiteLoginCoordinator({
		configFactory: () => ({ targetOrigin: "https://chatgpt.com" }),
		openBrowser: async () => ({ ok: true, debugPort: 9224 }),
		openLoginPage: async () => ({ ok: true }),
		gateFactory: () => ({ async authenticate() { throw new Error("must not block"); } }),
		sessionReader: async () => ({ ok: true, status: "logged_in" })
	});
	const opened = await coordinator.openForLogin();
	const status = await coordinator.status();
	assert.equal(opened.authenticated, true);
	assert.equal(status.authenticated, true);
	assert.equal(status.credentialValuesRead, false);
});

test("accepted prompt recovery is disabled and never opens a tab", async () => {
	const store = new ConversationStore({ storagePath: false });
	const service = new FallbackConversationService({
		store,
		portResolver: { async resolve() { throw new Error("must not resolve"); } },
		clientFactory: () => { throw new Error("must not create client"); }
	});
	await assert.rejects(
		() => service.recover({ conversationKey: "BH_DIRECT_OLD" }),
		error => error.code === "response_recovery_disabled_submit_only"
	);
});
