//B"H
//Boruch Hashem
//Blessed be He

import { codedError } from "./DirectServiceRequest.mjs";

/**
 * @file Keeps authentication retry separate from persistent Shliach-target protection.
 * @description
 * Rebinding the website transport may invalidate cached ports and clients, but it must
 * never release the human-login sentinel lease. That protected target is device-level
 * account infrastructure, not disposable state belonging to one send attempt.
 */
export class DirectServiceAuthentication {
	constructor(service) {
		if (!service?.websiteService || !service?.loginCoordinator) {
			throw new TypeError(
				"direct service with websiteService and loginCoordinator is required."
			);
		}
		this.service = service;
	}

	send(request, options = {}) {
		return this.execute("send", request, options);
	}

	recover(request, options = {}) {
		return this.execute("recover", request, options);
	}

	async execute(method, request, options) {
		try {
			return await this.service.websiteService[method](request);
		} catch (error) {
			if (!this.service.loginCoordinator.shouldAuthenticate(error)) {
				throw error;
			}
			if (options.loginPolicy === "defer") {
				await this.service.requestLogin();
				throw codedError("chatgpt_login_pending");
			}
			await this.service.authenticateLogin(options);
			await this.resetBrowserBinding();
			return this.service.websiteService[method](request);
		}
	}

	authenticate(options = {}) {
		return this.service.loginCoordinator.authenticate({
			timeoutMs: options.loginTimeoutMs,
			pollMs: options.loginPollMs
		});
	}

	async requestLogin() {
		const opened = await this.service.loginCoordinator.openForLogin();
		this.invalidate();
		return opened;
	}

	/**
	 * Rebinds transport caches while deliberately preserving the human-login lease.
	 * @returns {Promise<void>} Completion after website transport reset.
	 */
	async resetBrowserBinding() {
		this.invalidate();
		await this.service.websiteService.close();
	}

	invalidate() {
		this.service.capabilityService.invalidate?.();
		this.service.portResolver.invalidate();
	}
}
