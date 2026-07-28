//B"H
// Boruch Hashem
// Blessed is He

/**
 * The named fallback owns stateful chat execution and one bounded relay client.
 * The Awtsmoos lets Awtsmoos.com continue through an opaque key while a healthy
 * Chrome host may be reused; port changes close the former owned lifecycle first.
 */
export class FallbackConversationService {
	constructor({ store, portResolver, clientFactory }) {
		this.store = store;
		this.portResolver = portResolver;
		this.clientFactory = clientFactory;
		this.lastResolvedPort = null;
		this.clientPort = null;
		this.client = null;
	}

	async send({
		prompt,
		conversationKey,
		model = null,
		thinkingEffort = null,
		conversationMode = null,
		signal = null,
		onProgress = null,
		timeoutMs = null
	}) {
		const previousState = conversationKey
			? this.store.get(conversationKey)
			: null;
		if (conversationKey && !previousState) {
			throw new Error("The local direct conversation key expired or was not found.");
		}
		const port = await this.portResolver.resolve();
		this.lastResolvedPort = port;
		const client = await this.clientForPort(port);
		const result = await client.send({
			prompt,
			state: previousState,
			model,
			thinkingEffort,
			conversationMode,
			signal,
			onProgress,
			timeoutMs
		});
		this.assertContinuation(previousState, result);
		const localKey = this.store.set(conversationKey, result.state);
		return this.publicResult({
			result,
			localKey,
			created: !conversationKey
		});
	}

	async clientForPort(port) {
		if (this.client && this.clientPort === port) {
			return this.client;
		}
		await this.close();
		this.client = this.clientFactory(port);
		this.clientPort = port;
		return this.client;
	}

	assertContinuation(previousState, result) {
		const sameConversation = previousState
			? result.state.conversationId === previousState.conversationId
			: true;
		if (!sameConversation) {
			throw new Error("ChatGPT continuation returned a different conversation.");
		}
		if (result.navigatedToConversation) {
			throw new Error("The controller navigated to the direct conversation unexpectedly.");
		}
		result.sameConversation = sameConversation;
	}

	publicResult({ result, localKey, created }) {
		return {
			ok: true,
			mode: "page-authorized-fallback",
			answer: result.answer,
			conversationKey: localKey,
			created,
			status: result.status,
			done: result.done,
			frames: result.frames,
			items: result.items,
			subscriptionAttempts: result.subscriptionAttempts,
			completionSource: result.completionSource,
			requestLatencyMs: result.requestLatencyMs,
			pacing: result.pacing,
			hostReuseSource: result.hostReuseSource,
			sameConversation: result.sameConversation,
			navigatedToConversation: false,
			timings: result.timings
		};
	}

	async close() {
		const client = this.client;
		this.client = null;
		this.clientPort = null;
		await client?.close?.();
	}

	status() {
		return {
			lastResolvedPort: this.lastResolvedPort,
			clientActive: Boolean(this.client),
			client: this.client?.status?.() ?? null
		};
	}
}
