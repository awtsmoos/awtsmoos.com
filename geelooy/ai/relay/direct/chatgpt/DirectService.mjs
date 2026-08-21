// B"H
// Boruch Hashem
// Blessed is He

import { DirectServiceAuthentication } from "./DirectServiceAuthentication.mjs";
import { buildDirectServiceDependencies } from "./DirectServiceDependencies.mjs";
import { codedError, queueMetadata, requestFor, validateMode, validatePrompt } from "./DirectServiceRequest.mjs";

/**
 * @file Coordinates website turns through one coherent authentication and protection contract.
 * @description
 * The Awtsmoos does not let the healer devour the doorway through which healing enters.
 * Awtsmoos.com suspends every automatic closer before browser readiness, leases the exact
 * login target, then resumes cleanup only after all browser layers can see that same lease.
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
		return this.turnCoordinator.run(queueMetadata(options, "send"), callbacks =>
			this.authentication.send({ ...request, onSubmissionStarted: callbacks.onSubmissionStarted,
				onSubmissionAccepted: callbacks.onSubmissionAccepted, onTabClosed: callbacks.onTabClosed }, options));
	}

	async recover() {
		throw codedError("response_recovery_disabled_submit_only");
	}

	requestLogin() {
		return this.withProtectedLogin(() => this.authentication.requestLogin());
	}

	authenticateLogin(options = {}) {
		return this.withProtectedLogin(() => this.authentication.authenticate(options));
	}

	async withProtectedLogin(operation) {
		this.tabWatchdog?.stop?.();
		this.tabProtector?.suspendClosures?.();
		try {
			const result = await operation();
			if (result?.targetId) {
				this.tabProtector?.protectTarget?.(result.targetId, {
					kind: "human_login", port: result.debugPort, ttlMs: 15 * 60 * 1000
				});
			}
			return result;
		} finally {
			this.tabProtector?.resumeClosures?.();
			this.activateProtection();
		}
	}

	activateProtection() { this.tabWatchdog?.start?.(); }
	authenticationStatus() { return this.loginCoordinator.status(); }

	async capability(options = {}) {
		try { return this.capabilityPresenter.ready(await this.capabilityService.inspect(options)); }
		catch { return this.capabilityPresenter.loginRequired(); }
	}

	reset(conversationKey) { return this.reporter.reset({ conversationKey, store: this.store }); }

	async close() {
		this.tabWatchdog?.stop?.();
		this.tabProtector?.releaseProtections?.();
		return this.websiteService.close();
	}

	status() {
		return this.reporter.status({ preferredPort: this.preferredPort, websiteService: this.websiteService,
			store: this.store, turnCoordinator: this.turnCoordinator, tabProtector: this.tabProtector,
			tabWatchdog: this.tabWatchdog });
	}
}

export const directService = new DirectService();
