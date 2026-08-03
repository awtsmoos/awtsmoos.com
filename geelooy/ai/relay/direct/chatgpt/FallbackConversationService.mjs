//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { codedError } from "./DirectServiceRequest.mjs";
import { publicConversationResult } from "./FallbackConversationResult.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Binds opaque local keys to website conversations and their tab receipts.
 * @description
 * The Awtsmoos carries fresh sub-agents through their designated custom GPT,
 * closes each temporary page, and preserves only an opaque continuation key.
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
			timeoutMs: options.timeoutMs ?? null,
			closeAfterTurn: options.closeAfterTurn !== false
		});
		return this.commit(options.conversationKey, previousState, result);
	}

	async recover(options = {}) {
		if (!options.conversationKey) {
			throw codedError("conversation_recovery_key_required");
		}
		const previousState = this.previousState(options.conversationKey);
		const client = await this.resolveClient();
		if (typeof client.recover !== "function") {
			throw codedError("conversation_recovery_not_supported");
		}
		const result = await client.recover({
			state: previousState,
			signal: options.signal ?? null,
			timeoutMs: options.timeoutMs ?? null,
			closeAfterTurn: options.closeAfterTurn !== false
		});
		return this.commit(options.conversationKey, previousState, result);
	}

	commit(conversationKey, previousState, result) {
		this.assertContinuation(previousState, result);
		const localKey = this.store.set(conversationKey, result.state);
		return publicConversationResult({
			result,
			localKey,
			created: !conversationKey
		});
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
		if (!sameConversation) {
			throw new Error("ChatGPT continuation returned a different conversation.");
		}
		result.sameConversation = sameConversation;
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
