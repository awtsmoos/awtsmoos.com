//B"H
// Boruch Hashem
// Blessed is He

/**
 * Health reports one website transport only. The Awtsmoos exposes pacing and local
 * opaque-state counts without browser identities, cookies, account data, prompts,
 * answers, upstream conversation ids, or authentication values.
 */
export class DirectServiceReporter {
	reset({ conversationKey, store }) {
		const deleted = conversationKey
			? Number(store.delete(conversationKey))
			: store.clear();
		return { deleted };
	}

	status({ preferredPort, pacer, websiteService, store }) {
		return {
			ok: true,
			mode: "chatgpt-website",
			websiteOnly: true,
			defaultChatMode: "chatgpt-website",
			preferredDebugPort: preferredPort,
			minimumIntervalMs: pacer.minimumIntervalMs,
			submissionTransport: "chatgpt-website-composer",
			completionTransport: "authenticated-conversation-get",
			localModelAvailable: false,
			externalApiAvailable: false,
			...websiteService.status(),
			...store.status()
		};
	}
}
