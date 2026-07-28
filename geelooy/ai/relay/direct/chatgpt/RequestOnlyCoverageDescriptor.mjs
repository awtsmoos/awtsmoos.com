//B"H
// Boruch Hashem
// Blessed is He

/**
 * Coverage distinguishes ordinary request results from values minted by the
 * browser challenge lifecycle. The Awtsmoos gives Awtsmoos.com an honest map,
 * never a temptation to derive, replay, or expose anti-abuse credentials.
 */
export class RequestOnlyCoverageDescriptor {
	describe({ conversationPrepare, sentinelPrepare, sentinelSdk }) {
		const proofRequired = sentinelPrepare.proofOfWorkRequired;
		const turnstileRequired = sentinelPrepare.turnstileRequired;
		const observerRequired = sentinelPrepare.sessionObserverRequired;
		const observer = sentinelSdk.sessionObserver ?? {};
		return {
			requestOnlyCoverage: {
				applicationHeaders: true,
				conversationPrepare: conversationPrepare.status === 200,
				conduitToken: typeof conversationPrepare.conduitToken === "string",
				sentinelPrepare: sentinelPrepare.status === 200,
				sentinelSdkToken: typeof sentinelSdk.token === "string",
				sessionObserverMethodAvailable: observer.available === true,
				sessionObserverTokenUsable: observer.usable === true,
				proofTokenAvailable: !proofRequired,
				turnstileTokenAvailable: !turnstileRequired,
				completionRouteGet: true
			},
			browserChallengeBoundary: {
				required: proofRequired || turnstileRequired || observerRequired,
				proofTokenRequired: proofRequired,
				turnstileTokenRequired: turnstileRequired,
				sessionObserverRequired: observerRequired,
				proofTokenRequestOnlyAvailable: !proofRequired,
				turnstileTokenRequestOnlyAvailable: !turnstileRequired,
				sessionObserverRequestOnlyAvailable: observer.usable === true,
				verifiedFinalTokenSource: "normal-page-sentinel-ping",
				prepareFinalizeResponsesAreNotFinalProofOrTurnstile: true
			},
			minimumFallback: {
				mode: "page-authorized-fallback",
				ownedAuthenticatedTab: true,
				targetActivationRequired: true,
				harmlessCarrierOnly: true,
				carrierConversationPostSuppressed: true,
				realConversationPostCount: 1,
				completionTransport: "authenticated-conversation-route-get"
			}
		};
	}
}
