// B"H

import assert from "node:assert/strict";
import test from "node:test";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

test("website relay returns one opaque dispatch receipt and never an answer", async () => {
	let calls = 0;
	const service = new DirectService({
		portResolver: { async resolve() { return 9224; }, invalidate() {} },
		clientFactory: () => ({
			async send() {
				calls += 1;
				return dispatchResult(calls);
			},
			async close() {},
			status: () => ({ waitsForAnswer: false })
		}),
		loginCoordinator: neverLogin()
	});
	const result = await service.send({ prompt: "first", mode: "chatgpt-website" });
	assert.match(result.conversationKey, /^BH_DIRECT_/);
	assert.equal(result.answer, "");
	assert.equal(result.done, false);
	assert.equal(result.dispatched, true);
	assert.equal(result.accepted, true);
	assert.equal(result.promptVerified, true);
	assert.equal(result.tabClose.verified, true);
	assert.equal(calls, 1);
	assert.equal(JSON.stringify(result).includes("private-conversation"), false);
});

test("website relay performs one manual-login retry before dispatch", async () => {
	let sends = 0;
	let logins = 0;
	const websiteService = {
		async send() {
			sends += 1;
			if (sends === 1) throw new Error("ChatGPT is not authenticated.");
			return { ok: true, dispatched: true, answer: "" };
		},
		async close() {},
		status: () => ({})
	};
	const service = new DirectService({
		websiteService,
		portResolver: { invalidate() {} },
		loginCoordinator: {
			shouldAuthenticate: () => true,
			async authenticate() { logins += 1; }
		}
	});
	const result = await service.send({ prompt: "hello" });
	assert.equal(result.dispatched, true);
	assert.equal(result.answer, "");
	assert.equal(sends, 2);
	assert.equal(logins, 1);
});

test("website capability reports authenticated and login-required states", async () => {
	const authenticated = new DirectService({
		websiteService: serviceStub(),
		capabilityService: { async inspect() { return { ok: true, authenticated: true }; } },
		loginCoordinator: neverLogin()
	});
	const ready = await authenticated.capability();
	assert.equal(ready.mode, "chatgpt-website");
	assert.equal(ready.loginRequired, false);
	const missing = new DirectService({
		websiteService: serviceStub(),
		capabilityService: { async inspect() { throw new Error("offline"); } },
		loginCoordinator: neverLogin()
	});
	const login = await missing.capability();
	assert.equal(login.authenticated, false);
	assert.equal(login.loginRequired, true);
});

test("website relay rejects unrelated transport modes", async () => {
	let sends = 0;
	const service = new DirectService({
		websiteService: { ...serviceStub(), async send() { sends += 1; } },
		loginCoordinator: neverLogin()
	});
	await assert.rejects(
		() => service.send({ prompt: "hello", mode: "unrelated-provider" }),
		/Unsupported direct mode/
	);
	assert.equal(sends, 0);
});

function dispatchResult(call) {
	return {
		answer: "",
		state: { conversationId: "private-conversation", userMessageId: `private-message-${call}` },
		status: 202,
		done: false,
		dispatched: true,
		accepted: true,
		promptVerified: true,
		responseStatus: 200,
		acceptedAt: "2026-08-03T15:00:00.000Z",
		completionSource: "not-awaited-agent-continues-through-tunnel",
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer",
		tabClose: { closed: true, verified: true, attempts: 1 }
	};
}

function serviceStub() {
	return { async send() { return { ok: true, dispatched: true, answer: "" }; },
		async close() {}, status: () => ({}) };
}

function neverLogin() {
	return { shouldAuthenticate: () => false,
		async authenticate() { throw new Error("Login must not run."); } };
}
