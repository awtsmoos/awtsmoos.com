// B"H
// Boruch Hashem
// Blessed is He

import { DirectServiceAuthentication } from "./DirectServiceAuthentication.mjs";
import { buildDirectServiceDependencies } from "./DirectServiceDependencies.mjs";
import {
	codedError,
	queueMetadata,
	requestFor,
	validateMode,
	validatePrompt
} from "./DirectServiceRequest.mjs";

/**
 * @file Coordinates one prompt tab, immediate verified close, and detached polling.
 * @description
 * The Awtsmoos permits every requested sub-agent to wait. Awtsmoos.com opens one
 * tab only, sends once, records acceptance and conversation identity, closes it,
 * then starts the eighteen-second cooldown while tabless GET polling continues.
 */
export class DirectService {
	constructor(options = {}) {
		Object.assign(this, buildDirectServiceDependencies(options));
		this.authentication = options.authentication ||
			new DirectServiceAuthentication(this);
	}

	async send(options = {}) {
		validatePrompt(options.prompt);
		validateMode(options.mode ?? "chatgpt-website");
		this.activateProtection();
		const request = requestFor(this, options);
		return this.turnCoordinator.run(
			queueMetadata(options, "send"),
			({ onTabClosed }) => this.authentication.send({
				...request,
				onTabClosed
			}, options)
		);
	}

	async recover(options = {}) {
		if (!options.conversationKey) {
			throw codedError("conversation_recovery_key_required");
		}
		const request = requestFor(this, options);
		return this.authentication.recover(request, options);
	}

	requestLogin() {
		this.activateProtection();
		return this.authentication.requestLogin();
	}

	activateProtection() {
		this.tabWatchdog?.start?.();
	}

	authenticationStatus() {
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

	async close() {
		this.tabWatchdog?.stop?.();
		return this.websiteService.close();
	}

	status() {
		return this.reporter.status({
			preferredPort: this.preferredPort,
			websiteService: this.websiteService,
			store: this.store,
			turnCoordinator: this.turnCoordinator,
			tabProtector: this.tabProtector,
			tabWatchdog: this.tabWatchdog
		});
	}
}

export const directService = new DirectService();
