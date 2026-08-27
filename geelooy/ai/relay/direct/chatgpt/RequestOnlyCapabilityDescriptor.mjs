//B"H
// Boruch Hashem
// Blessed is He

import { RequestOnlyCoverageDescriptor } from "./RequestOnlyCoverageDescriptor.mjs";

/**
 * Capability truth reports transport readiness and enforcement boundaries only.
 * The Awtsmoos lets Awtsmoos.com reveal no conduit, Sentinel, challenge, session,
 * account, proof, Turnstile, or upstream identity value.
 */
export class RequestOnlyCapabilityDescriptor {
	constructor({ coverage = new RequestOnlyCoverageDescriptor() } = {}) {
		this.coverage = coverage;
	}

	describe({ port, host, conversationPrepare, sentinelPrepare, sentinelSdk }) {
		const enforcementRequired = sentinelPrepare.turnstileRequired
			|| sentinelPrepare.proofOfWorkRequired
			|| sentinelPrepare.sessionObserverRequired;
		const coverage = this.coverage.describe({
			conversationPrepare,
			sentinelPrepare,
			sentinelSdk
		});
		return {
			ok: true,
			mode: "strict-request-only",
			debugPort: port,
			hostRoute: host.pageState.url,
			authenticated: host.pageState.authenticated,
			composerTouched: false,
			conversationPostSent: false,
			socketRequired: false,
			completionTransport: "authenticated-conversation-route-get",
			conversationPrepare: {
				ready: conversationPrepare.status === 200,
				hasConduitToken: typeof conversationPrepare.conduitToken === "string"
			},
			sentinelPrepare: {
				ready: sentinelPrepare.status === 200,
				turnstileRequired: sentinelPrepare.turnstileRequired,
				proofOfWorkRequired: sentinelPrepare.proofOfWorkRequired,
				sessionObserverRequired: sentinelPrepare.sessionObserverRequired,
				forceLogin: sentinelPrepare.forceLogin
			},
			sentinelSdk: {
				ready: typeof sentinelSdk.token === "string",
				hasInit: sentinelSdk.hasInit,
				hasToken: sentinelSdk.hasToken,
				hasTiming: sentinelSdk.hasTiming,
				sessionObserverMethodAvailable: sentinelSdk.sessionObserver?.available === true,
				sessionObserverTokenUsable: sentinelSdk.sessionObserver?.usable === true
			},
			...coverage,
			enforcementRequired,
			strictChatReady: !enforcementRequired,
			fallbackRequired: enforcementRequired,
			fallbackMode: "page-authorized-fallback"
		};
	}
}
