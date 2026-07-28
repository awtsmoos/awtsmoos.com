//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { RequestOnlyCapabilityDescriptor } from "../relay/direct/chatgpt/RequestOnlyCapabilityDescriptor.mjs";

/** Capability explains the exact browser challenge boundary and minimum fallback. */
test("capability reports request coverage without secret values", () => {
	const result = new RequestOnlyCapabilityDescriptor().describe({
		port: 9223,
		host: {
			pageState: {
				url: "https://chatgpt.com/settings",
				authenticated: true
			}
		},
		conversationPrepare: {
			status: 200,
			conduitToken: "internal-conduit"
		},
		sentinelPrepare: {
			status: 200,
			turnstileRequired: true,
			proofOfWorkRequired: true,
			sessionObserverRequired: true,
			forceLogin: false
		},
		sentinelSdk: {
			token: "internal-sdk",
			hasInit: true,
			hasToken: true,
			hasTiming: true,
			sessionObserver: {
				available: true,
				usable: false
			}
		}
	});
	assert.equal(result.socketRequired, false);
	assert.equal(result.requestOnlyCoverage.conduitToken, true);
	assert.equal(result.requestOnlyCoverage.proofTokenAvailable, false);
	assert.equal(result.requestOnlyCoverage.turnstileTokenAvailable, false);
	assert.equal(result.requestOnlyCoverage.sessionObserverMethodAvailable, true);
	assert.equal(result.requestOnlyCoverage.sessionObserverTokenUsable, false);
	assert.equal(result.browserChallengeBoundary.required, true);
	assert.equal(
		result.browserChallengeBoundary.verifiedFinalTokenSource,
		"normal-page-sentinel-ping"
	);
	assert.equal(result.minimumFallback.carrierConversationPostSuppressed, true);
	assert.equal(result.minimumFallback.realConversationPostCount, 1);
	const serialized = JSON.stringify(result);
	assert.equal(serialized.includes("internal-conduit"), false);
	assert.equal(serialized.includes("internal-sdk"), false);
});
