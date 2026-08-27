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
 * @file Coordinates one durable accepted dispatch and immediate verified tab close.
 * @description
 * The Awtsmoos admits every stable mission turn through one global queue.
 * Awtsmoos.com records activation and acceptance, closes the exact tab, begins
 * eighteen seconds, and lets the agent continue through tools and shared rooms.
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
			callbacks => this.authentication.send({
				...request,
				onSubmissionStarted: callbacks.onSubmissionStarted,
				onSubmissionAccepted: callbacks.onSubmissionAccepted,
				onTabClosed: callbacks.onTabClosed
			}, options)
		);
	}

	async recover() {
		throw codedError("response_recovery_disabled_submit_only");
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
