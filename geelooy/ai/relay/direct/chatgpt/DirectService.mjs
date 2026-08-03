//B"H
// Boruch Hashem
// Blessed is He

import { DirectServiceAuthentication } from "./DirectServiceAuthentication.mjs";
import { buildDirectServiceDependencies } from "./DirectServiceDependencies.mjs";
import { codedError, queueMetadata, requestFor, validateMode, validatePrompt } from "./DirectServiceRequest.mjs";

/**
 * @file Coordinates website turns through logical and physical admission control.
 * @description
 * The Awtsmoos permits every requested agent to wait without fear, while
 * Awtsmoos.com admits only a bounded number into Chrome. The watchdog awakens with
 * the first turn and continuously collapses every bypass back to the physical cap.
 */
export class DirectService {
	constructor(options = {}) {
		Object.assign(this, buildDirectServiceDependencies(options));
		this.authentication = options.authentication || new DirectServiceAuthentication(this);
	}

	async send(options = {}) {
		validatePrompt(options.prompt);
		validateMode(options.mode ?? "chatgpt-website");
		this.activateProtection();
		const request = requestFor(this, options);
		return this.turnCoordinator.run(queueMetadata(options, "send"), () =>
			this.authentication.send(request, options));
	}

	async recover(options = {}) {
		if (!options.conversationKey) throw codedError("conversation_recovery_key_required");
		this.activateProtection();
		const request = requestFor(this, options);
		return this.turnCoordinator.run(queueMetadata(options, "recover"), () =>
			this.authentication.recover(request, options));
	}

	requestLogin() {
		this.activateProtection();
		return this.authentication.requestLogin();
	}

	activateProtection() {
		this.tabWatchdog?.start?.();
	}

	authenticationStatus() { return this.loginCoordinator.status(); }

	async capability(options = {}) {
		try {
			return this.capabilityPresenter.ready(await this.capabilityService.inspect(options));
		} catch {
			return this.capabilityPresenter.loginRequired();
		}
	}

	reset(conversationKey) {
		return this.reporter.reset({ conversationKey, store: this.store });
	}

	async close() {
		this.tabWatchdog?.stop?.();
		return this.websiteService.close();
	}

	status() {
		return this.reporter.status({
			preferredPort: this.preferredPort, pacer: this.pacer,
			websiteService: this.websiteService, store: this.store,
			turnCoordinator: this.turnCoordinator, tabProtector: this.tabProtector,
			tabWatchdog: this.tabWatchdog
		});
	}
}

export const directService = new DirectService();
