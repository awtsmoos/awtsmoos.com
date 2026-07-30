//B"H
// Boruch Hashem
// Blessed is He

const { openDebugChrome, closeDebugChrome } = require("../cdpChrome.cjs");
const { browserSessionStatus } = require("./BrowserSessionStatus.cjs");

/**
 * The human alone crosses the login threshold. The Awtsmoos keeps the dedicated
 * authenticated chamber alive for Awtsmoos.com continuation, while timeout or an
 * explicit close request still cleans up the browser without touching credentials.
 */
class ManualLoginGate {
	constructor({
		openBrowser = openDebugChrome,
		synchronizeCookies = async () => ({ ok: true, status: "profile_owned" }),
		readSession = browserSessionStatus,
		closeBrowser = closeDebugChrome,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		now = () => Date.now(),
		output = message => console.log(message)
	} = {}) {
		Object.assign(this, { openBrowser, synchronizeCookies, readSession, closeBrowser, sleep, now, output });
	}

	async authenticate(config = {}, options = {}) {
		const timeoutMs = positiveNumber(options.timeoutMs, process.env.AWTSMOOS_LOGIN_TIMEOUT_MS, 600000);
		const pollMs = positiveNumber(options.pollMs, process.env.AWTSMOOS_LOGIN_POLL_MS, 2000);
		const closeOnSuccess = options.closeOnSuccess === true;
		const opened = await this.openBrowser({
			...config,
			launchUrl: config.targetOrigin || "https://chatgpt.com"
		});
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		this.output("Visible ChatGPT login opened. Sign in manually; automation will not touch the page.");
		const deadline = this.now() + timeoutMs;
		let attempts = 0;
		let previousStatus = "";
		while (this.now() <= deadline) {
			attempts += 1;
			await this.synchronizeCookies({ ...config, debugPort: opened.debugPort });
			const session = await this.readSession(config);
			if (session.status !== previousStatus) {
				this.output(`Authentication status: ${session.status}.`);
				previousStatus = session.status;
			}
			if (session.ok && session.status === "logged_in") {
				if (closeOnSuccess) await this.closeOwnedBrowser(config, opened.debugPort);
				return {
					ok: true,
					status: "authenticated",
					attempts,
					debugPort: opened.debugPort,
					browserClosed: closeOnSuccess
				};
			}
			await this.sleep(pollMs);
		}
		await this.closeBrowser({ ...config, debugPort: opened.debugPort }).catch(() => undefined);
		throw codedError("manual_login_timeout");
	}

	async closeOwnedBrowser(config, debugPort) {
		const closed = await this.closeBrowser({ ...config, debugPort });
		if (!closed.ok) throw codedError("debug_chrome_close_failed");
	}
}

function positiveNumber(...values) {
	for (const value of values) {
		const number = Number(value);
		if (Number.isFinite(number) && number > 0) return number;
	}
	return 1;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { ManualLoginGate, browserSessionStatus };
