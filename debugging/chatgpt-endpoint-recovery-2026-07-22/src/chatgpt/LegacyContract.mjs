//B"H
// Boruch Hashem
// Blessed is He

/**
 * This is not a claim about today's service. It is a fossil from the supplied
 * AwtsmoosGPTify.js. The Awtsmoos recreates the present; awtsmoos.com preserves
 * the old vessel only so captured reality can be compared against it.
 */
export const legacyContract = Object.freeze({
	createConversation: {
		method: "POST",
		pathname: "/backend-api/conversation",
		headers: {
			"content-type": "application/json",
			authorization: "Bearer <accessToken>",
			"openai-sentinel-chat-requirements-token": "<requirementsToken>",
			"openai-sentinel-proof-token": "<proofToken>"
		},
		body: {
			action: "next",
			messages: [{
				id: "<uuid>",
				author: { role: "user" },
				content: { content_type: "text", parts: ["<prompt>"] },
				metadata: {}
			}],
			parent_message_id: "<uuid>",
			model: "auto",
			conversation_id: "<optional>"
		}
	},
	chatRequirements: {
		method: "POST",
		pathname: "/backend-api/sentinel/chat-requirements",
		body: { p: "<requirementsProof>" }
	},
	readEndpoints: [
		"GET /api/auth/session",
		"GET /backend-api/conversations",
		"GET /backend-api/conversation/{conversationId}",
		"GET /backend-api/synthesize"
	]
});
