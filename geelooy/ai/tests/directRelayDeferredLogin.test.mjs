//B"H
import assert from "node:assert/strict";
import test from "node:test";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";
import { ConversationStore } from "../relay/direct/chatgpt/ConversationStore.mjs";
import { FallbackConversationService } from "../relay/direct/chatgpt/FallbackConversationService.mjs";
import { WebsiteLoginCoordinator } from "../relay/direct/chatgpt/WebsiteLoginCoordinator.mjs";

test("website mission login policy opens once and returns without retrying a POST", async () => {
	let sends = 0;
	let opens = 0;
	let blockingAuthentications = 0;
	const service = new DirectService({
		websiteService: {
			async send() {
				sends += 1;
				throw new Error("ChatGPT is not authenticated.");
			},
			async close() {},
			status() { return {}; }
		},
		portResolver: {
			invalidate() {}
		},
		capabilityService: {
			invalidate() {}
		},
		loginCoordinator: {
			shouldAuthenticate: () => true,
			async openForLogin() {
				opens += 1;
				return { ok: true, opened: true, authenticated: false };
			},
			async authenticate() {
				blockingAuthentications += 1;
			}
		}
	});
	await assert.rejects(
		() => service.send({
			prompt: "mission prompt",
			mode: "chatgpt-website",
			loginPolicy: "defer"
		}),
		error => error.code === "chatgpt_login_pending"
	);
	assert.equal(sends, 1);
	assert.equal(opens, 1);
	assert.equal(blockingAuthentications, 0);
});

test("login coordinator reuses the visible profile and reports only redacted state", async () => {
	let opens = 0;
	let gates = 0;
	const coordinator = new WebsiteLoginCoordinator({
		configFactory: () => ({ targetOrigin: "https://chatgpt.com" }),
		openBrowser: async () => {
			opens += 1;
			return { ok: true, debugPort: 9223 };
		},
		gateFactory: () => ({
			async authenticate() {
				gates += 1;
				throw new Error("blocking gate should not run");
			}
		}),
		sessionReader: async () => ({ ok: true, status: "logged_in" })
	});
	const opened = await coordinator.openForLogin();
	const status = await coordinator.status();
	assert.equal(opened.reusedProfile, true);
	assert.equal(opened.authenticated, true);
	assert.equal(status.authenticated, true);
	assert.equal(status.credentialValuesRead, false);
	assert.equal(opens, 1);
	assert.equal(gates, 0);
	assert.deepEqual(
		Object.keys(status).sort(),
		["authenticated", "credentialValuesRead", "debugPort", "ok", "status"].sort()
	);
});

test("accepted continuation recovery keeps the opaque key and performs no submission", async () => {
	const store = new ConversationStore({ storagePath: false });
	const key = store.create({
		conversationId: "private-conversation",
		parentMessageId: "private-previous-assistant"
	});
	let sends = 0;
	let recoveries = 0;
	const service = new FallbackConversationService({
		store,
		portResolver: {
			async resolve() { return 9223; }
		},
		clientFactory: () => ({
			async send() {
				sends += 1;
				throw new Error("send must not run");
			},
			async recover({ state }) {
				recoveries += 1;
				return {
					answer: "Recovered answer",
					state: {
						conversationId: state.conversationId,
						parentMessageId: "private-new-assistant"
					},
					status: 200,
					done: true,
					items: 4,
					subscriptionAttempts: 1,
					completionSource: "page-request-get-recovery",
					composerTouched: false,
					submissionTransport: "none-get-recovery"
				};
			},
			async close() {},
			status() { return {}; }
		})
	});
	const result = await service.recover({ conversationKey: key });
	assert.equal(result.conversationKey, key);
	assert.equal(result.sameConversation, true);
	assert.equal(result.composerTouched, false);
	assert.equal(result.submissionTransport, "none-get-recovery");
	assert.equal(sends, 0);
	assert.equal(recoveries, 1);
});
