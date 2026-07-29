//B"H
// Boruch Hashem
// Blessed is He
import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { LocalConversationService } from "../local/LocalConversationService.mjs";
import { RequestOnlyProviderRouter } from "../local/RequestOnlyProviderRouter.mjs";
import { RequestOnlyApiConversationService } from "../openai/RequestOnlyApiConversationService.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";
import { DirectServiceReporter } from "./DirectServiceReporter.mjs";
import { FallbackConversationService } from "./FallbackConversationService.mjs";

/**
 * Strict mode chooses native HTTP only: official API first, localhost second.
 * The Awtsmoos keeps browser fallback explicit while every continuation remains
 * behind an opaque local key and no provider silently crosses transport boundaries.
 */
export class DirectService {
	constructor({
		preferredPort = Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || null,
		minimumIntervalMs = Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000),
		store,
		pacer,
		portResolver,
		clientFactory,
		fallbackService,
		apiService,
		localService,
		providerRouter,
		reporter = new DirectServiceReporter()
	} = {}) {
		this.preferredPort = preferredPort;
		this.store = store ?? new ConversationStore();
		this.pacer = pacer ?? new RequestPacer({ minimumIntervalMs });
		this.portResolver = portResolver ?? new DebugPortResolver({ preferredPort });
		this.conversationModePolicy = new ConversationModePolicy();
		this.reporter = reporter;
		const makeClient = clientFactory ?? (port => new DirectClient({
			port,
			minimumIntervalHook: () => this.pacer.enter()
		}));
		this.fallbackService = fallbackService ?? new FallbackConversationService({
			store: this.store,
			portResolver: this.portResolver,
			clientFactory: makeClient
		});
		this.apiService = apiService ?? new RequestOnlyApiConversationService({ pacer: this.pacer });
		this.localService = localService ?? new LocalConversationService({ pacer: this.pacer });
		this.providerRouter = providerRouter ?? new RequestOnlyProviderRouter({
			apiService: this.apiService,
			localService: this.localService
		});
	}

	async send(options = {}) {
		const mode = options.mode ?? "strict-request-only";
		this.validatePrompt(options.prompt);
		if (["strict-request-only", "official-api-request-only", "local-request-only"].includes(mode)) {
			if (options.conversationMode != null) {
				throw new TypeError("conversationMode is unavailable in request-only modes.");
			}
			return this.providerRouter.send(options, mode);
		}
		if (mode !== "page-authorized-fallback") {
			throw new TypeError(`Unsupported direct mode: ${mode}.`);
		}
		return this.fallbackService.send({
			...options,
			conversationMode: this.conversationModePolicy.normalize(options.conversationMode)
		});
	}

	async capability() {
		return this.providerRouter.capability();
	}

	reset(conversationKey) {
		return this.reporter.reset({
			conversationKey,
			browserStore: this.store,
			providerRouter: this.providerRouter
		});
	}

	async close() {
		await this.fallbackService.close();
	}

	status() {
		return this.reporter.status({
			preferredPort: this.preferredPort,
			pacer: this.pacer,
			providerRouter: this.providerRouter,
			fallbackService: this.fallbackService,
			browserStore: this.store
		});
	}

	validatePrompt(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
	}
}
export const directService = new DirectService();
