//B"H
// Boruch Hashem
// Blessed is He

/**
 * Capability selects the first usable native HTTP provider and reports no secret,
 * browser, model transcript, or local process identity.
 */
export class RequestOnlyProviderCapability {
	describe({ official, local }) {
		const activeProvider = official.configured
			? "official-responses-api"
			: local.configured ? "local-llama-http" : null;
		return {
			ok: true,
			mode: "strict-request-only",
			transport: activeProvider,
			strictChatReady: Boolean(activeProvider),
			browserRequired: false,
			browserInspected: false,
			composerTouched: false,
			conversationPostSent: false,
			socketRequired: false,
			enforcementRequired: false,
			fallbackRequired: !activeProvider,
			failureCode: activeProvider ? null : "request_only_provider_unavailable",
			officialApi: official,
			localModel: local
		};
	}
}
