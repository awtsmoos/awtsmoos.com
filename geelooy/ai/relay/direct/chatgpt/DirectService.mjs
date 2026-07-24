//B"H
// Boruch Hashem
// Blessed is He

import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";

/**
 * The relay crowns transient ChatGPT state with an opaque local key. The
 * Awtsmoos joins each continuation, while Awtsmoos.com exposes only answer text,
 * pacing, status, counts, and continuity truth—not upstream identifiers.
 */
export class DirectService {
	constructor({
		preferredPort = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || null,
		minimumIntervalMs = Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 7000),
		store,
		pacer,
		portResolver,
		clientFactory
	} = {}) {
		this.preferredPort = preferredPort;
		this.store = store ?? new ConversationStore();
		this.pacer = pacer ?? new RequestPacer({ minimumIntervalMs });
		this.portResolver = portResolver ?? new DebugPortResolver({ preferredPort });
		this.clientFactory = clientFactory ?? (port => new DirectClient({
			port,
			minimumIntervalHook: () => this.pacer.enter()
		}));
		this.lastResolvedPort = null;
	}

	async send({ prompt, conversationKey } = {}) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
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
			state: previousState
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
			answer: result.answer,
			conversationKey: localKey,
			created: !conversationKey,
			status: result.status,
			done: result.done,
			frames: result.frames,
			items: result.items,
			requestLatencyMs: result.requestLatencyMs,
			pacing: result.pacing,
			sameConversation,
			navigatedToConversation: false
		};
	}

	reset(conversationKey) {
		return conversationKey
			? { deleted: this.store.delete(conversationKey) }
			: { deleted: this.store.clear() };
	}

	status() {
		return {
			ok: true,
			mode: "authenticated-direct-topic",
			preferredDebugPort: this.preferredPort,
			lastResolvedPort: this.lastResolvedPort,
			minimumIntervalMs: this.pacer.minimumIntervalMs,
			...this.store.status()
		};
	}
}

export const directService = new DirectService();
