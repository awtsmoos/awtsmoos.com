//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyProviderRouter } from "../relay/direct/local/RequestOnlyProviderRouter.mjs";

function service({ configured, name }) {
	return {
		configured: async () => configured,
		async send() { return { provider: name }; },
		reset: () => ({ deleted: 0 }),
		status: () => ({ configured, transport: name, activeConversations: 0 })
	};
}

/** Strict mode prefers official HTTP and falls back only to local HTTP. */
test("provider router selects request-only providers in order", async () => {
	const official = service({ configured: true, name: "official" });
	official.configured = () => true;
	const local = service({ configured: true, name: "local" });
	const router = new RequestOnlyProviderRouter({ apiService: official, localService: local });
	assert.equal((await router.send({}, "strict-request-only")).provider, "official");

	const missingOfficial = service({ configured: false, name: "official" });
	missingOfficial.configured = () => false;
	const localRouter = new RequestOnlyProviderRouter({
		apiService: missingOfficial,
		localService: local
	});
	assert.equal((await localRouter.send({}, "strict-request-only")).provider, "local");
	assert.equal((await localRouter.capability()).transport, "local-llama-http");
});

/** Missing providers fail without browser fallback. */
test("provider router fails closed when HTTP providers are absent", async () => {
	const official = service({ configured: false, name: "official" });
	official.configured = () => false;
	const local = service({ configured: false, name: "local" });
	const router = new RequestOnlyProviderRouter({ apiService: official, localService: local });
	await assert.rejects(
		() => router.send({}, "strict-request-only"),
		error => error.code === "request_only_provider_unavailable"
	);
});
