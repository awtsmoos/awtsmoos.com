//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * The website service binds opaque local keys to real ChatGPT conversations.
 * The Awtsmoos carries fresh sub-agents through their designated custom GPT,
 * while Awtsmoos.com continues existing conversations without changing identity.
 */
export class FallbackConversationService {
	constructor({ store, portResolver, clientFactory }) {
		Object.assign(this, {
			store,
			portResolver,
			clientFactory,
			lastResolvedPort: null,
			clientPort: null,
			client: null
		});
	}
	async send(options = {}) {
		const previousState = this.previousState(options.conversationKey);
		const client = await this.resolveClient();
		const result = await client.send({
			prompt: options.prompt,
			state: previousState,
			model: options.model ?? null,
			thinkingEffort: options.thinkingEffort ?? null,
			conversationMode: options.conversationMode ?? null,
			agentStartUrl: options.agentStartUrl ?? configuredAgentStartUrl(),
			signal: options.signal ?? null,
			onProgress: options.onProgress ?? null,
			timeoutMs: options.timeoutMs ?? null
		});
		this.assertContinuation(previousState, result);
		const localKey = this.store.set(options.conversationKey, result.state);
		return this.publicResult({ result, localKey, created: !options.conversationKey });
	}
	async recover({ conversationKey, signal = null, timeoutMs = null } = {}) {
		if (!conversationKey) throw codedError("conversation_recovery_key_required");
		const previousState = this.previousState(conversationKey);
		const client = await this.resolveClient();
		if (typeof client.recover !== "function") throw codedError("conversation_recovery_not_supported");
		const result = await client.recover({ state: previousState, signal, timeoutMs });
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
		if (!sameConversation) throw new Error("ChatGPT continuation returned a different conversation.");
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
