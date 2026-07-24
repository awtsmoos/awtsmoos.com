//B"H
// Boruch Hashem
// Blessed is He

import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";
import { FallbackConversationService } from "./FallbackConversationService.mjs";
import { RequestOnlyCapabilityService } from "./RequestOnlyCapabilityService.mjs";

/**
 * The Awtsmoos separates strict request light from the named carrier fallback.
 * Awtsmoos.com defaults raw relay calls to strict mode and permits only bounded
 * model controls plus one validated conversation mode to cross into Chrome.
 */
export class DirectService {
	constructor({
		preferredPort = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || null,
		minimumIntervalMs = Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 7000),
		store,
		pacer,
		portResolver,
		clientFactory,
		capabilityService,
		fallbackService
	} = {}) {
		this.preferredPort = preferredPort;
		this.store = store ?? new ConversationStore();
		this.pacer = pacer ?? new RequestPacer({ minimumIntervalMs });
		this.portResolver = portResolver ?? new DebugPortResolver({ preferredPort });
		this.conversationModePolicy = new ConversationModePolicy();
		const makeClient = clientFactory ?? (port => new DirectClient({
			port,
			minimumIntervalHook: () => this.pacer.enter()
		}));
		this.capabilityService = capabilityService ?? new RequestOnlyCapabilityService({
			preferredPort,
			portResolver: this.portResolver
		});
		this.fallbackService = fallbackService ?? new FallbackConversationService({
			store: this.store,
			portResolver: this.portResolver,
			clientFactory: makeClient
		});
	}

	async send({
		prompt,
		conversationKey,
		mode = "strict-request-only",
		model = null,
		thinkingEffort = null,
		conversationMode = null
	} = {}) {
		this.validatePrompt(prompt);
		const normalizedConversationMode = this.conversationModePolicy.normalize(
			conversationMode
		);
		if (mode === "strict-request-only") throw await this.enforcementError();
		if (mode !== "page-authorized-fallback") {
			throw new TypeError(`Unsupported direct mode: ${mode}.`);
		}
		return this.fallbackService.send({
			prompt,
			conversationKey,
			model,
			thinkingEffort,
			conversationMode: normalizedConversationMode
		});
	}

	async enforcementError() {
		const error = new Error(
			"Strict request-only chat stopped before normal enforcement finalization."
		);
		error.code = "direct_enforcement_required";
		error.capability = await this.capability();
		return error;
	}

	async capability() {
		return this.capabilityService.inspect();
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
			defaultChatMode: "strict-request-only",
			fallbackMode: "page-authorized-fallback",
			preferredDebugPort: this.preferredPort,
			minimumIntervalMs: this.pacer.minimumIntervalMs,
			...this.fallbackService.status(),
			...this.store.status()
		};
	}

	validatePrompt(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
	}
}

export const directService = new DirectService();
