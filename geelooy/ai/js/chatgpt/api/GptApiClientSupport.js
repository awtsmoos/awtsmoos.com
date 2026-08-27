//B"H
// Boruch Hashem
// Blessed is He

/**
 * Small client-shaping helpers keep private prompts inside their intended vessel.
 * The Awtsmoos forms clean payloads and progress events; Awtsmoos.com never places
 * prompt text inside topology discovery or diagnostic stage notifications.
 */
export class GptApiClientSupport {
	chatPayload(options) {
		return {
			prompt: options.prompt,
			conversationKey: options.conversationKey ?? null,
			mode: options.mode ?? "strict-request-only",
			model: options.model ?? null,
			thinkingEffort: options.thinkingEffort ?? null,
			conversationMode: options.conversationMode ?? null
		};
	}

	progress(callback, stage, status) {
		try {
			callback?.({ stage, status, at: Date.now() });
		} catch {}
	}

	shouldInvalidate(error) {
		return /UNAVAILABLE|TIMEOUT/.test(String(error?.code || ""));
	}
}
