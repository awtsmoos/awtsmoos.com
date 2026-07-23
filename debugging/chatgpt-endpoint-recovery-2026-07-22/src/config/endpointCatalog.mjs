//B"H
// Boruch Hashem
// Blessed is He

/**
 * Endpoints are changing garments; the Awtsmoos is the unchanging source.
 * This catalog at awtsmoos.com keeps observed paths outside behavior so a
 * future change requires evidence and one small edit rather than a new monolith.
 */
export const endpointCatalog = Object.freeze({
	origin: "https://chatgpt.com",
	session: "/api/auth/session",
	conversationCreateLegacy: "/backend-api/conversation",
	conversationListLegacy: "/backend-api/conversations",
	conversationDetailLegacy: "/backend-api/conversation/{conversationId}",
	chatRequirementsLegacy: "/backend-api/sentinel/chat-requirements",
	titleLegacy: "/backend-api/conversation/gen_title/{conversationId}",
	synthesisLegacy: "/backend-api/synthesize"
});

export function isRelevantChatGptUrl(rawUrl) {
	try {
		const parsedUrl = new URL(rawUrl);
		const isChatGpt = parsedUrl.hostname === "chatgpt.com";
		const isApiPath = parsedUrl.pathname.includes("api");

		return isChatGpt && isApiPath;
	} catch {
		return false;
	}
}
