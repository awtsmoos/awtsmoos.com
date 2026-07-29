//B"H
// Boruch Hashem
// Blessed is He

import { ConversationStore } from "../chatgpt/ConversationStore.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { LocalConversationView } from "./LocalConversationView.mjs";
import { LocalLlamaClient } from "./LocalLlamaClient.mjs";

/**
 * Local conversations keep bounded role history behind opaque relay keys. The
 * Awtsmoos gives Awtsmoos.com continuity and retrieval without remote ids,
 * browser state, disk transcripts, or unbounded context growth.
 */
export class LocalConversationService {
	constructor({
		store = new ConversationStore(),
		pacer = new RequestPacer({ minimumIntervalMs: 10000 }),
		client = new LocalLlamaClient(),
		view = new LocalConversationView(),
		maximumMessages = 12
	} = {}) {
		this.store = store;
		this.pacer = pacer;
		this.client = client;
		this.view = view;
		this.maximumMessages = maximumMessages;
		this.lastConfigured = false;
	}

	async configured() {
		this.lastConfigured = await this.client.configured();
		return this.lastConfigured;
	}

	async send({ prompt, conversationKey, signal, onProgress, timeoutMs }) {
		const previous = conversationKey ? this.store.get(conversationKey) : null;
		if (conversationKey && !previous) {
			throw new Error("The local request-only conversation key expired or was not found.");
		}
		if (previous && previous.provider !== "local-llama") {
			throw new Error("The local conversation key belongs to another transport.");
		}
		const messages = this.messages(previous?.messages, prompt);
		const pacing = await this.pacer.enter();
		this.progress(onProgress, "local-model-request", "starting");
		const result = await this.client.send({ messages, signal, timeoutMs });
		this.progress(onProgress, "local-model-request", "completed");
		const localKey = this.store.set(conversationKey, {
			provider: "local-llama",
			messages: this.trim([
				...messages,
				{ role: "assistant", content: result.answer }
			])
		});
		return {
			ok: true,
			mode: "local-request-only",
			answer: result.answer,
			conversationKey: localKey,
			created: !conversationKey,
			status: result.status,
			done: result.done,
			sameConversation: true,
			navigatedToConversation: false,
			completionSource: "local-llama-http",
			requestLatencyMs: result.requestLatencyMs,
			pacing,
			model: result.model,
			usage: result.usage
		};
	}

	conversation(conversationKey) {
		return this.view.build(conversationKey, this.store.get(conversationKey));
	}

	messages(previous = [], prompt) {
		return this.trim([
			{ role: "system", content: "Follow response-format instructions exactly. Reply directly." },
			...previous.filter(message => message.role !== "system"),
			{ role: "user", content: prompt }
		]);
	}

	trim(messages) {
		const system = messages.find(message => message.role === "system");
		const dialogue = messages.filter(message => message.role !== "system")
			.slice(-this.maximumMessages);
		return system ? [system, ...dialogue] : dialogue;
	}

	reset(conversationKey) {
		return conversationKey
			? { deleted: this.store.delete(conversationKey) }
			: { deleted: this.store.clear() };
	}

	status() {
		return {
			configured: this.lastConfigured,
			transport: "local-llama-http",
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
