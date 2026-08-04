// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { publicConversationResult } from "./FallbackConversationResult.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Stores private dispatch evidence without creating a response continuation.
 * @description
 * The Awtsmoos may preserve a local receipt for auditing, yet no browser turn waits
 * for or reopens the model conversation. The custom GPT reports independently through
 * files and tunnel actions after the delivery vessel has already disappeared.
 */
export class FallbackConversationService {
	constructor({ store, portResolver, clientFactory }) {
		Object.assign(this, { store, portResolver, clientFactory,
			lastResolvedPort: null, clientPort: null, client: null });
	}

	async send(options = {}) {
		const client = await this.resolveClient();
		const result = await client.send({
			prompt: options.prompt,
			model: options.model ?? null,
			thinkingEffort: options.thinkingEffort ?? null,
			conversationMode: options.conversationMode ?? null,
			agentStartUrl: options.agentStartUrl ?? configuredAgentStartUrl(),
			signal: options.signal ?? null,
			onProgress: options.onProgress ?? null,
			onTabClosed: options.onTabClosed ?? null,
			timeoutMs: options.timeoutMs ?? null
		});
		const localKey = this.store.set(null, result.state);
		return publicConversationResult({ result, localKey });
	}

	async recover() {
		const error = new Error("response_recovery_disabled_submit_only");
		error.code = "response_recovery_disabled_submit_only";
		throw error;
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
