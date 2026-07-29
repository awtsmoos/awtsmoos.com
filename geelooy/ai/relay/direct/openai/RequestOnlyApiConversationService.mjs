//B"H
// Boruch Hashem
// Blessed is He

import { ConversationStore } from "../chatgpt/ConversationStore.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { OpenAiResponsesClient } from "./OpenAiResponsesClient.mjs";

/**
 * Official API continuations remain behind opaque local keys. The Awtsmoos lets
 * Awtsmoos.com chain previous response ids entirely through HTTP while the public
 * result reveals only answer text, safe counts, pacing, and local continuity.
 */
export class RequestOnlyApiConversationService {
	constructor({
		store = new ConversationStore(),
		pacer = new RequestPacer({ minimumIntervalMs: 10000 }),
		client = new OpenAiResponsesClient()
	} = {}) {
		this.store = store;
		this.pacer = pacer;
		this.client = client;
	}

	configured() {
		return this.client.configured();
	}

	async send({
		prompt,
		conversationKey,
		model = null,
		thinkingEffort = null,
		signal = null,
		onProgress = null,
		timeoutMs = null
	}) {
		const previousState = conversationKey ? this.store.get(conversationKey) : null;
		if (conversationKey && !previousState) {
			throw new Error("The local request-only conversation key expired or was not found.");
		}
		if (previousState && previousState.provider !== "openai-responses") {
			throw new Error("The local conversation key belongs to another transport.");
		}
		const pacing = await this.pacer.enter();
		this.progress(onProgress, "official-api-request", "starting");
		const result = await this.client.send({
			prompt,
			previousResponseId: previousState?.responseId ?? null,
			model,
			thinkingEffort,
			signal,
			timeoutMs
		});
		this.progress(onProgress, "official-api-request", "completed");
		const localKey = this.store.set(conversationKey, {
			provider: "openai-responses",
			responseId: result.responseId
		});
		return {
			ok: true,
			mode: "official-api-request-only",
			answer: result.answer,
			conversationKey: localKey,
			created: !conversationKey,
			status: result.status,
			done: result.done,
			sameConversation: true,
			navigatedToConversation: false,
			completionSource: "official-responses-api",
			requestLatencyMs: result.requestLatencyMs,
			pacing,
			model: result.model,
			usage: result.usage
		};
	}

	conversation() {
		return null;
	}

	reset(conversationKey) {
		return conversationKey
			? { deleted: this.store.delete(conversationKey) }
			: { deleted: this.store.clear() };
	}

	status() {
		const credential = this.client.credentialStatus();
		return {
			configured: credential.configured,
			credentialSource: credential.source,
			transport: "official-responses-api",
			minimumIntervalMs: this.pacer.minimumIntervalMs,
			...this.store.status()
		};
	}

	progress(callback, stage, status) {
		try {
			callback?.({ stage, status, at: Date.now() });
		} catch {}
	}
}
