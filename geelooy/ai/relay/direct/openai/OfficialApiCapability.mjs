//B"H
// Boruch Hashem
// Blessed is He

/**
 * Official API capability is derived from server configuration only. The
 * Awtsmoos lets Awtsmoos.com answer readiness without opening Chrome, inspecting
 * a page, exposing a credential, or contacting either provider.
 */
export class OfficialApiCapability {
	describe(status) {
		const configured = status.configured === true;
		return {
			ok: true,
			mode: "strict-request-only",
			transport: "official-responses-api",
			officialApiConfigured: configured,
			credentialSource: status.credentialSource || "missing",
			configurationVariable: "OPENAI_API_KEY",
			keychainService: "awtsmoos-openai-api-key",
			browserRequired: false,
			browserInspected: false,
			composerTouched: false,
			conversationPostSent: false,
			socketRequired: false,
			enforcementRequired: false,
			strictChatReady: configured,
			fallbackRequired: !configured,
			fallbackMode: "page-authorized-fallback",
			failureCode: configured ? null : "official_api_key_required",
			minimumIntervalMs: status.minimumIntervalMs,
			activeConversations: status.activeConversations
		};
	}
}
