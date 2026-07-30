//B"H
// Boruch Hashem
// Blessed is He

/**
 * The website service owns stateful ChatGPT execution and one bounded browser
 * host. Opaque keys are the only continuation identity exposed to callers.
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
		const previousState = this.previousState(conversationKey);
		const client = await this.resolveClient();
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
		return this.publicResult({ result, localKey, created: !conversationKey });
	}

	async recover({
		conversationKey,
		signal = null,
		timeoutMs = null
	} = {}) {
		if (!conversationKey) {
			throw codedError("conversation_recovery_key_required");
		}
		const previousState = this.previousState(conversationKey);
		const client = await this.resolveClient();
		if (typeof client.recover !== "function") {
			throw codedError("conversation_recovery_not_supported");
		}
		const result = await client.recover({
			state: previousState,
			signal,
			timeoutMs
		});
		this.assertContinuation(previousState, result);
		const localKey = this.store.set(conversationKey, result.state);
		return this.publicResult({ result, localKey, created: false });
	}

	previousState(conversationKey) {
		const state = conversationKey ? this.store.get(conversationKey) : null;
		if (conversationKey && !state) {
			throw new Error("The local ChatGPT conversation key expired or was not found.");
		}
		return state;
	}

	async resolveClient() {
		const port = await this.portResolver.resolve();
		this.lastResolvedPort = port;
		return this.clientForPort(port);
	}

	async clientForPort(port) {
		if (this.client && this.clientPort === port) return this.client;
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
		result.sameConversation = sameConversation;
	}

	publicResult({ result, localKey, created }) {
		return {
			ok: true,
			mode: "chatgpt-website",
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
			navigatedToConversation: result.navigatedToConversation,
			composerTouched: result.composerTouched === true,
			submissionTransport: result.submissionTransport,
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

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
