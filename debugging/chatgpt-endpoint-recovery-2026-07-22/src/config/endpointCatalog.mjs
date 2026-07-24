//B"H
// Boruch Hashem
// Blessed is He

/**
 * Endpoints are garments renewed beneath the light of the Awtsmoos. This
 * awtsmoos.com catalog separates observed guest routes from historical routes,
 * so evidence can change one vessel without confusing the whole application.
 */
export const endpointCatalog = Object.freeze({
	origin: "https://chatgpt.com",
	observedAt: "2026-07-23",
	guest: Object.freeze({
		conversationPrepare: "/unauth-mweb/conversation/prepare",
		conversationUpdates: "/unauth-mweb/conversation/updates",
		sentinelPrepare: "/unauth-mweb/sentinel/chat-requirements/prepare",
		sentinelFinalize: "/unauth-mweb/sentinel/chat-requirements/finalize",
		sentinelPing: "/unauth-mweb/sentinel/ping"
	}),
	legacy: Object.freeze({
		conversationCreate: "/backend-api/conversation",
		conversationList: "/backend-api/conversations",
		conversationDetail: "/backend-api/conversation/{conversationId}",
		chatRequirements: "/backend-api/sentinel/chat-requirements",
		title: "/backend-api/conversation/gen_title/{conversationId}",
		synthesis: "/backend-api/synthesize"
	})
});

export function isChatGptUrl(rawUrl) {
	try {
		const hostname = new URL(rawUrl).hostname;
		return hostname === "chatgpt.com" || hostname.endsWith(".chatgpt.com");
	} catch {
		return false;
	}
}

export function isConversationTransportUrl(rawUrl) {
	try {
		const parsedUrl = new URL(rawUrl);
		return isChatGptUrl(rawUrl) && parsedUrl.pathname.includes("/conversation/");
	} catch {
		return false;
	}
}
