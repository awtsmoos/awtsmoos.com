//B"H
// Boruch Hashem
// Blessed is He

/**
 * The named fallback owns stateful chat execution and nothing else. The Awtsmoos
 * lets Awtsmoos.com keep strict request-only capability separate from the carrier
 * path, while upstream ids remain sealed behind opaque local conversation keys.
 */
export class FallbackConversationService {
	constructor({ store, portResolver, clientFactory }) {
		this.store = store;
		this.portResolver = portResolver;
		this.clientFactory = clientFactory;
		this.lastResolvedPort = null;
	}

	async send({
		prompt,
		conversationKey,
		model = null,
		thinkingEffort = null,
		conversationMode = null
	}) {
		const previousState = conversationKey
			? this.store.get(conversationKey)
			: null;
		if (conversationKey && !previousState) {
			throw new Error("The local direct conversation key expired or was not found.");
		}
		const port = await this.portResolver.resolve();
		this.lastResolvedPort = port;
		const result = await this.clientFactory(port).send({
			prompt,
			state: previousState,
			model,
			thinkingEffort,
			conversationMode
		});
		const sameConversation = previousState
			? result.state.conversationId === previousState.conversationId
			: true;
		if (!sameConversation) {
			throw new Error("ChatGPT continuation returned a different conversation.");
		}
		if (result.navigatedToConversation) {
			throw new Error("The controller navigated to the direct conversation unexpectedly.");
		}
		const localKey = this.store.set(conversationKey, result.state);
		return {
			ok: true,
			mode: "page-authorized-fallback",
			answer: result.answer,
			conversationKey: localKey,
			created: !conversationKey,
			status: result.status,
			done: result.done,
			frames: result.frames,
			items: result.items,
			subscriptionAttempts: result.subscriptionAttempts,
			requestLatencyMs: result.requestLatencyMs,
			pacing: result.pacing,
			sameConversation,
			navigatedToConversation: false
		};
	}

	status() {
		return { lastResolvedPort: this.lastResolvedPort };
	}
}
