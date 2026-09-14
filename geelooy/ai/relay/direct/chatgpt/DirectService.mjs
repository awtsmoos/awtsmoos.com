//B"H
//Boruch Hashem
//Blessed be He

import { DirectServiceAuthentication } from "./DirectServiceAuthentication.mjs";
import { buildDirectServiceDependencies } from "./DirectServiceDependencies.mjs";
import {
	ensureProtectedLoginSurface,
	withProtectedLogin
} from "./DirectServiceLoginProtection.mjs";
import {
	codedError,
	queueMetadata,
	requestFor,
	validateMode,
	validatePrompt
} from "./DirectServiceRequest.mjs";

/**
 * @file Coordinates website turns through one protected Shared AI Shliach doorway.
 * @description
 * Every physical turn protects the exact configured Shliach target before automatic
 * cleanup starts. Authentication, exactly-once Send custody, and tab cleanup therefore
 * share one browser identity without sacrificing the persistent account/login sentinel.
 */
export class DirectService {
	constructor(options = {}) {
		Object.assign(this, buildDirectServiceDependencies(options));
		this.authentication = options.authentication || new DirectServiceAuthentication(this);
	}

	/** Sends one turn only after the Shliach sentinel is durably protected. */
	async send(options = {}) {
		validatePrompt(options.prompt);
		validateMode(options.mode ?? "chatgpt-website");
		await ensureProtectedLoginSurface(this);
		this.activateProtection();
		const request = requestFor(this, options);
		return this.turnCoordinator.run(queueMetadata(options, "send"), callbacks =>
			this.authentication.send({
				...request,
				onSubmissionStarted: callbacks.onSubmissionStarted,
				onSubmissionAccepted: callbacks.onSubmissionAccepted,
				onTabClosed: callbacks.onTabClosed
			}, options));
	}

	async recover() {
		throw codedError("response_recovery_disabled_submit_only");
	}

	requestLogin() {
		return withProtectedLogin(this, () => this.authentication.requestLogin());
	}

	authenticateLogin(options = {}) {
		return withProtectedLogin(this, () => this.authentication.authenticate(options));
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
		return this.reporter.reset({
			conversationKey,
			store: this.store
		});
	}

	async close() {
		this.tabWatchdog?.stop?.();
		this.tabProtector?.releaseProtections?.();
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
