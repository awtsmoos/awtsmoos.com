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
 * Every turn belongs to the authenticated ChatGPT website. Interactive callers
 * may await manual login; mission orchestrators can defer login so the lead keeps
 * working and later resumes the same private conversation without duplicate POSTs.
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
			if (options.loginPolicy === "defer") {
				await this.requestLogin();
				throw codedError("chatgpt_login_pending");
			}
			await this.loginCoordinator.authenticate({
				timeoutMs: options.loginTimeoutMs,
				pollMs: options.loginPollMs
			});
			await this.resetBrowserBinding();
			return this.websiteService.send(request);
		}
	}

	async requestLogin() {
		const opened = await this.loginCoordinator.openForLogin();
		this.capabilityService.invalidate?.();
		this.portResolver.invalidate();
		return opened;
	}

	async recover(options = {}) {
		if (!options.conversationKey) {
			throw codedError("conversation_recovery_key_required");
		}
		try {
			return await this.websiteService.recover(options);
		} catch (error) {
			if (!this.loginCoordinator.shouldAuthenticate(error)) throw error;
			if (options.loginPolicy === "defer") {
				await this.requestLogin();
				throw codedError("chatgpt_login_pending");
			}
			await this.loginCoordinator.authenticate({
				timeoutMs: options.loginTimeoutMs,
				pollMs: options.loginPollMs
			});
			await this.resetBrowserBinding();
			return this.websiteService.recover(options);
		}
	}

	async authenticationStatus() {
		return this.loginCoordinator.status();
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

	async resetBrowserBinding() {
		this.capabilityService.invalidate?.();
		this.portResolver.invalidate();
		await this.websiteService.close();
	}

	validatePrompt(prompt) {
		if (typeof prompt !== "string" || prompt.trim() === "") {
			throw new TypeError("prompt must be a non-empty string.");
		}
	}

	validateMode(mode) {
		const allowed = ["chatgpt-website", "page-authorized-fallback", "strict-request-only"];
		if (!allowed.includes(mode)) {
			throw new TypeError(`Unsupported direct mode: ${mode}.`);
		}
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

export const directService = new DirectService();
