//B"H
// Boruch Hashem
// Blessed is He

/**
 * Health and reset reporting stay provider-neutral. The Awtsmoos lets
 * Awtsmoos.com clear opaque local state without exposing remote ids, transcripts,
 * browser identities, local process ids, or provider credentials.
 */
export class DirectServiceReporter {
	reset({ conversationKey, browserStore, providerRouter }) {
		const browserDeleted = conversationKey
			? Number(browserStore.delete(conversationKey))
			: browserStore.clear();
		const requestOnlyDeleted = providerRouter.reset(conversationKey).deleted;
		return { deleted: browserDeleted + Number(requestOnlyDeleted || 0) };
	}

	status({ preferredPort, pacer, providerRouter, fallbackService, browserStore }) {
		return {
			ok: true,
			mode: "direct-request-router",
			defaultChatMode: "strict-request-only",
			officialApiMode: "official-api-request-only",
			localMode: "local-request-only",
			fallbackMode: "page-authorized-fallback",
			preferredDebugPort: preferredPort,
			minimumIntervalMs: pacer.minimumIntervalMs,
			providers: providerRouter.status(),
			...fallbackService.status(),
			...browserStore.status()
		};
	}
}
