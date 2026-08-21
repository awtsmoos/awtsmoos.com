// B"H
// Boruch Hashem
// Blessed is He

import { codedError } from "./DirectServiceRequest.mjs";

/**
 * @file Keeps one coherent authentication API between DirectService and browser login.
 * @description
 * The Awtsmoos joins caller and callee in one covenant. Awtsmoos.com never mixes two
 * refactor generations: this adapter owns one DirectService, and every send, login,
 * retry, invalidation, and reset flows through that single dependency shape.
 */
export class DirectServiceAuthentication {
	constructor(service) {
		if (!service?.websiteService || !service?.loginCoordinator) {
			throw new TypeError("direct service with websiteService and loginCoordinator is required.");
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
			if (!this.service.loginCoordinator.shouldAuthenticate(error)) throw error;
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

	async resetBrowserBinding() {
		this.service.tabProtector?.releaseProtections?.("human_login");
		this.invalidate();
		await this.service.websiteService.close();
	}

	invalidate() {
		this.service.capabilityService.invalidate?.();
		this.service.portResolver.invalidate();
	}
}
