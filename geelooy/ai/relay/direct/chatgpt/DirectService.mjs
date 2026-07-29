//B"H
// Boruch Hashem
// Blessed is He

import { DebugPortResolver } from "../browser/DebugPortResolver.mjs";
import { RequestPacer } from "../stress/RequestPacer.mjs";
import { ConversationModePolicy } from "./ConversationModePolicy.mjs";
import { ConversationStore } from "./ConversationStore.mjs";
import { DirectClient } from "./DirectClient.mjs";
import { DirectServiceReporter } from "./DirectServiceReporter.mjs";
import { FallbackConversationService } from "./FallbackConversationService.mjs";
import { RequestOnlyCapabilityService } from "./RequestOnlyCapabilityService.mjs";
import { WebsiteCapabilityPresenter } from "./WebsiteCapabilityPresenter.mjs";
import { WebsiteLoginCoordinator } from "./WebsiteLoginCoordinator.mjs";

/**
 * Every turn belongs to the authenticated ChatGPT website. The Awtsmoos first tries
 * the saved browser profile, opens a visible manual login only when authentication
 * is absent, and never routes to a local model or external API credential.
 */
export class DirectService {
	constructor(options = {}) {
		this.preferredPort = options.preferredPort
			?? (Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || null);
		this.store = options.store ?? new ConversationStore();
		this.pacer = options.pacer ?? new RequestPacer({
			minimumIntervalMs: options.minimumIntervalMs
				?? Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000)
		});
		this.portResolver = options.portResolver ?? new DebugPortResolver({
			preferredPort: this.preferredPort
		});
		this.loginCoordinator = options.loginCoordinator ?? new WebsiteLoginCoordinator();
		this.reporter = options.reporter ?? new DirectServiceReporter();
		this.capabilityPresenter = options.capabilityPresenter
			?? new WebsiteCapabilityPresenter();
		this.conversationModePolicy = new ConversationModePolicy();
		const clientFactory = options.clientFactory ?? (port => new DirectClient({
			port,
			minimumIntervalHook: () => this.pacer.enter()
		}));
		this.websiteService = options.websiteService ?? new FallbackConversationService({
			store: this.store,
			portResolver: this.portResolver,
			clientFactory
		});
		this.capabilityService = options.capabilityService
			?? new RequestOnlyCapabilityService({
				preferredPort: this.preferredPort,
				portResolver: this.portResolver
			});
	}

	async send(options = {}) {
		this.validatePrompt(options.prompt);
		this.validateMode(options.mode ?? "chatgpt-website");
		const request = {
			...options,
			conversationMode: this.conversationModePolicy.normalize(options.conversationMode)
		};
		try {
			return await this.websiteService.send(request);
		} catch (error) {
			if (!this.loginCoordinator.shouldAuthenticate(error)) throw error;
			await this.loginCoordinator.authenticate();
			this.portResolver.invalidate();
			await this.websiteService.close();
			return await this.websiteService.send(request);
		}
	}

	async capability(options = {}) {
		try {
			return this.capabilityPresenter.ready(
				await this.capabilityService.inspect(options)
			);
		} catch {
			return this.capabilityPresenter.loginRequired();
		}
	}

	reset(conversationKey) {
		return this.reporter.reset({ conversationKey, store: this.store });
	}

	close() {
		return this.websiteService.close();
	}

	status() {
		return this.reporter.status({
			preferredPort: this.preferredPort,
			pacer: this.pacer,
			websiteService: this.websiteService,
			store: this.store
		});
	}

	validatePrompt(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
	}

	validateMode(mode) {
		const allowed = ["chatgpt-website", "page-authorized-fallback", "strict-request-only"];
		if (!allowed.includes(mode)) throw new TypeError(`Unsupported direct mode: ${mode}.`);
	}
}

export const directService = new DirectService();
