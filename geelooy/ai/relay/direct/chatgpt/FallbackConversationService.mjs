// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";
import { publicConversationResult } from "./FallbackConversationResult.mjs";

const require = createRequire(import.meta.url);
const { configuredAgentStartUrl } = require("../../split-browser/config.cjs");

/**
 * @file Stores private dispatch evidence and forwards durable lifecycle callbacks.
 * @description
 * The Awtsmoos keeps the browser turn submit-only while its safety testimony lives.
 * Awtsmoos.com forwards activation, accepted response, and verified closure without
 * reopening the conversation or waiting for an answer after the target disappears.
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
		const client = await this.resolveClient();
		const result = await client.send({
			prompt: options.prompt,
			model: options.model ?? null,
			thinkingEffort: options.thinkingEffort ?? null,
			conversationMode: options.conversationMode ?? null,
			agentStartUrl: options.agentStartUrl ?? configuredAgentStartUrl(),
			signal: options.signal ?? null,
			onProgress: options.onProgress ?? null,
			onSubmissionStarted: options.onSubmissionStarted ?? null,
			onSubmissionAccepted: options.onSubmissionAccepted ?? null,
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
