// B"H
// Boruch Hashem
// Blessed is He

const { openDebugChrome, closeDebugChrome } = require("../cdpChrome.cjs");
const { browserSessionStatus } = require("./BrowserSessionStatus.cjs");
const { configuredAgentStartUrl } = require("../config.cjs");
const { ensureHumanLoginPage } = require("../humanLoginPage.cjs");

/** Human-owned login gate that keeps its persistent Chrome unless explicitly closed. */
class ManualLoginGate {
	constructor(options = {}) {
		this.openBrowser = options.openBrowser || openDebugChrome;
		this.openLoginPage = options.openLoginPage || ensureHumanLoginPage;
		this.synchronizeCookies = options.synchronizeCookies || (async () => ({ ok: true }));
		this.readSession = options.readSession || browserSessionStatus;
		this.closeBrowser = options.closeBrowser || closeDebugChrome;
		this.sleep = options.sleep || (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)));
		this.now = options.now || (() => Date.now());
		this.output = options.output || (message => console.log(message));
	}

	async authenticate(config = {}, options = {}) {
		const timeoutMs = positiveNumber(options.timeoutMs, process.env.AWTSMOOS_LOGIN_TIMEOUT_MS, 600000);
		const pollMs = positiveNumber(options.pollMs, process.env.AWTSMOOS_LOGIN_POLL_MS, 2000);
		const closeOnSuccess = options.closeOnSuccess === true;
		const closeOnTimeout = options.closeOnTimeout === true;
		const loginUrl = config.agentStartUrl || configuredAgentStartUrl();
		const opened = await this.openBrowser({ ...config, launchUrl: loginUrl });
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		await this.openLoginPage({ debugPort: opened.debugPort, url: loginUrl });
		this.output("Visible ChatGPT login opened. Sign in manually; automation will not touch the page.");
		const deadline = this.now() + timeoutMs;
		let attempts = 0;
		let previousStatus = "";
		while (this.now() <= deadline) {
			attempts += 1;
			await this.synchronizeCookies({ ...config, debugPort: opened.debugPort });
			const session = await this.readSession({ ...config, debugPort: opened.debugPort });
			if (session.status !== previousStatus) {
				this.output(`Authentication status: ${session.status}.`);
				previousStatus = session.status;
			}
			if (session.ok && session.status === "logged_in") {
				if (closeOnSuccess) await this.closeOwnedBrowser(config, opened.debugPort);
				return { ok: true, status: "authenticated", attempts,
					debugPort: opened.debugPort, browserClosed: closeOnSuccess };
			}
			await this.sleep(pollMs);
		}
		if (closeOnTimeout) await this.closeOwnedBrowser(config, opened.debugPort);
		const error = codedError("manual_login_timeout");
		error.browserClosed = closeOnTimeout;
		error.debugPort = opened.debugPort;
		throw error;
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
