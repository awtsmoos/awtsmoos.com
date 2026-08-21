// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Wraps website calls with explicit shared-login behavior and no rapid reopen loop.
 * @description
 * The Awtsmoos reveals authentication as a human covenant, not an automation storm.
 * Awtsmoos.com may request one visible login surface, then every waiting caller receives
 * the same paused truth until the profile is genuinely authenticated or the long lease expires.
 */
export class DirectServiceAuthentication {
	constructor(websiteService, loginCoordinator) {
		this.websiteService = websiteService;
		this.loginCoordinator = loginCoordinator;
	}

	async execute(method, request, options = {}) {
		try {
			return await this.websiteService[method](request);
		} catch (error) {
			if (!this.loginCoordinator.shouldAuthenticate(error)) throw error;
			if (options.loginPolicy === "defer") {
				const login = await this.requestLogin();
				throw pendingError(login);
			}
			await this.loginCoordinator.authenticate({ waitMs: options.loginWaitMs });
			return this.websiteService[method](request);
		}
	}

	async requestLogin() {
		const opened = await this.loginCoordinator.openForLogin();
		if (!opened.ok) throw codedError("chatgpt_login_open_failed");
		return opened;
	}

	async authenticationStatus() {
		return this.loginCoordinator.status();
	}
}

function pendingError(login = {}) {
	const error = codedError(login.throttled ? "chatgpt_login_paused" : "chatgpt_login_pending");
	error.login = login;
	return error;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
