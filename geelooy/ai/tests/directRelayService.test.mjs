//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { DirectService } from "../relay/direct/chatgpt/DirectService.mjs";

/** Website turns create and continue behind one opaque local key. */
test("website relay preserves opaque ChatGPT continuity", async () => {
	let call = 0;
	const upstreamConversation = "website-conversation-secret";
	const service = new DirectService({
		portResolver: {
			async resolve() { return 9223; },
			invalidate() {}
		},
		clientFactory: () => ({
			async send({ prompt, state }) {
				call += 1;
				return websiteResult({ prompt, state, upstreamConversation, call });
			},
			async close() {},
			status: () => ({})
		}),
		loginCoordinator: neverLogin()
	});
	const created = await service.send({ prompt: "first", mode: "chatgpt-website" });
	const continued = await service.send({
		prompt: "second",
		conversationKey: created.conversationKey
	});
	const serialized = JSON.stringify({ created, continued });
	assert.match(created.conversationKey, /^BH_DIRECT_/);
	assert.equal(continued.conversationKey, created.conversationKey);
	assert.equal(continued.sameConversation, true);
	assert.equal(continued.composerTouched, true);
	assert.equal(continued.submissionTransport, "chatgpt-website-composer");
	assert.equal(serialized.includes(upstreamConversation), false);
	assert.equal(serialized.includes("website-message"), false);
});

/** Missing authentication opens manual login and retries the website turn once. */
test("website relay performs one manual-login retry", async () => {
	let sends = 0;
	let logins = 0;
	let closes = 0;
	let invalidations = 0;
	const websiteService = {
		async send() {
			sends += 1;
			if (sends === 1) throw new Error("ChatGPT is not authenticated.");
			return { ok: true, answer: "ready" };
		},
		async close() { closes += 1; },
		status: () => ({})
	};
	const service = new DirectService({
		websiteService,
		portResolver: {
			invalidate() { invalidations += 1; }
		},
		loginCoordinator: {
			shouldAuthenticate: () => true,
			async authenticate() { logins += 1; }
		}
	});
	const result = await service.send({ prompt: "hello" });
	assert.equal(result.answer, "ready");
	assert.equal(sends, 2);
	assert.equal(logins, 1);
	assert.equal(closes, 1);
	assert.equal(invalidations, 1);
});

/** Capability truth is website-only whether authenticated or awaiting login. */
test("website capability reports authenticated and login-required states", async () => {
	const authenticated = new DirectService({
		websiteService: serviceStub(),
		capabilityService: {
			async inspect() { return { ok: true, authenticated: true }; }
		},
		loginCoordinator: neverLogin()
	});
	const ready = await authenticated.capability();
	assert.equal(ready.mode, "chatgpt-website");
	assert.equal(ready.websiteOnly, true);
	assert.equal(ready.loginRequired, false);

	const missing = new DirectService({
		websiteService: serviceStub(),
		capabilityService: {
			async inspect() { throw new Error("No Chrome debug browser was found."); }
		},
		loginCoordinator: neverLogin()
	});
	const login = await missing.capability();
	assert.equal(login.websiteOnly, true);
	assert.equal(login.authenticated, false);
	assert.equal(login.loginRequired, true);
});

/** Unrelated modes are rejected before any website turn. */
test("website relay rejects unrelated transport modes", async () => {
	let sends = 0;
	const service = new DirectService({
		websiteService: {
			...serviceStub(),
			async send() { sends += 1; }
		},
		loginCoordinator: neverLogin()
	});
	await assert.rejects(
		() => service.send({ prompt: "hello", mode: "unrelated-provider" }),
		/Unsupported direct mode/
	);
	assert.equal(sends, 0);
});

function websiteResult({ prompt, state, upstreamConversation, call }) {
	return {
		answer: `answer:${prompt}`,
		state: {
			conversationId: state?.conversationId ?? upstreamConversation,
			parentMessageId: `website-message-${call}`
		},
		status: 200,
		done: true,
		frames: 0,
		items: 6,
		subscriptionAttempts: 1,
		completionSource: "page-request-get",
		requestLatencyMs: 12,
		pacing: { intervalMs: call === 1 ? null : 10000 },
		hostReuseSource: call === 1 ? "fresh" : "reused",
		navigatedToConversation: true,
		composerTouched: true,
		submissionTransport: "chatgpt-website-composer"
	};
}

function serviceStub() {
	return {
		async send() { return { ok: true, answer: "ready" }; },
		async close() {},
		status: () => ({})
	};
}

function neverLogin() {
	return {
		shouldAuthenticate: () => false,
		async authenticate() { throw new Error("Login must not run."); }
	};
}
