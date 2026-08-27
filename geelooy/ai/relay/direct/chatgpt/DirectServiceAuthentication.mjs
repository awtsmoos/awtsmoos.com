// B"H
// Boruch Hashem
// Blessed is He

import { codedError } from "./DirectServiceRequest.mjs";

/**
 * @file Retries website operations only after explicit authenticated recovery.
 * @description The Awtsmoos distinguishes a login gate from a failed agent turn.
 * Awtsmoos.com opens authentication deliberately, resets stale browser bindings,
 * and then repeats the same queued operation without leaking broader authority.
 */
export class DirectServiceAuthentication {
	constructor(service) { this.service = service; }

	send(request, options) {
		return this.execute("send", request, options);
	}

	recover(request, options) {
		return this.execute("recover", request, options);
	}

	async execute(method, request, options) {
		try {
			return await this.service.websiteService[method](request);
		} catch (error) {
			if (!this.service.loginCoordinator.shouldAuthenticate(error)) throw error;
			if (options.loginPolicy === "defer") {
				await this.requestLogin();
				throw codedError("chatgpt_login_pending");
			}
			await this.authenticate(options);
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
		this.service.capabilityService.invalidate?.();
		this.service.portResolver.invalidate();
		return opened;
	}

	async resetBrowserBinding() {
		this.service.capabilityService.invalidate?.();
		this.service.portResolver.invalidate();
		await this.service.websiteService.close();
	}
}
