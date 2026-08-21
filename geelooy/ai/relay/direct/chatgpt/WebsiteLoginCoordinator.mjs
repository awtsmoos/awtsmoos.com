// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig, configuredAgentStartUrl } = require("../../split-browser/config.cjs");
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");
const { ensureHumanLoginPage } = require("../../split-browser/humanLoginPage.cjs");
const { ManualLoginGate, browserSessionStatus } = require("../../split-browser/commands/ManualLoginGate.cjs");
const MIN_LOGIN_REOPEN_MS = 300000;
let authenticationFlight = null;
let openingFlight = null;
let lastOpenAttemptAt = 0;
let lastOpenReceipt = null;

/**
 * @file Coordinates one visible human login surface with a global five-minute reopen lease.
 * @description
 * The Awtsmoos welcomes every waiting shliach, yet Awtsmoos.com opens one doorway once.
 * Concurrent callers share one flight; later callers receive the same quiet receipt until
 * five minutes pass, preventing dozens of missions from making one browser flicker and race.
 */
export class WebsiteLoginCoordinator {
	constructor(options = {}) {
		this.configFactory = options.configFactory || loadConfig;
		this.gateFactory = options.gateFactory || (() => new ManualLoginGate());
		this.openBrowser = options.openBrowser || openDebugChrome;
		this.openLoginPage = options.openLoginPage || ensureHumanLoginPage;
		this.sessionReader = options.sessionReader || browserSessionStatus;
		this.now = options.now || (() => Date.now());
		this.reopenMs = Math.max(MIN_LOGIN_REOPEN_MS, Number(options.reopenMs || 0));
		this.lastDebugPort = null;
	}

	async authenticate(options = {}) {
		authenticationFlight ??= this.authenticateOnce(options).finally(() => {
			authenticationFlight = null;
		});
		return authenticationFlight;
	}

	async authenticateOnce(options = {}) {
		const config = this.configFactory();
		const login = await this.gateFactory().authenticate(config, options);
		const reopened = await this.openBrowser({ ...config, debugPort: login.debugPort,
			launchUrl: config.agentStartUrl || configuredAgentStartUrl() });
		if (!reopened.ok) throw codedError("authenticated_profile_reopen_failed");
		this.remember(login.debugPort);
		return { ok: true, status: "authenticated", authenticated: true,
			debugPort: login.debugPort, browserReopened: true };
	}

	async openForLogin() {
		const now = this.now();
		if (!openingFlight && lastOpenReceipt && now - lastOpenAttemptAt < this.reopenMs) {
			return throttledReceipt(lastOpenReceipt, lastOpenAttemptAt + this.reopenMs);
		}
		openingFlight ??= this.openForLoginOnce().finally(() => {
			openingFlight = null;
		});
		return openingFlight;
	}

	async openForLoginOnce() {
		lastOpenAttemptAt = this.now();
		const config = this.configFactory();
		const loginUrl = config.agentStartUrl || configuredAgentStartUrl();
		const opened = await this.openBrowser({ ...config,
			debugPort: this.lastDebugPort || Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || undefined,
			launchUrl: loginUrl });
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		const page = await this.openLoginPage({ debugPort: opened.debugPort, url: loginUrl });
		this.remember(opened.debugPort);
		const status = await this.status();
		lastOpenReceipt = { ok: true, opened: true, visibleLoginPage: page.ok === true,
			reusedProfile: true, debugPort: opened.debugPort,
			authenticated: status.authenticated, status: status.status };
		return { ...lastOpenReceipt, nextOpenAt: new Date(lastOpenAttemptAt + this.reopenMs).toISOString() };
	}

	async status() {
		const config = this.configFactory();
		const debugPort = this.lastDebugPort || Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || undefined;
		const session = await this.sessionReader({ ...config, debugPort });
		const authenticated = session.ok && session.status === "logged_in";
		return { ok: true, authenticated,
			status: authenticated ? "authenticated" : session.status,
			debugPort: Number(debugPort || 0) || null, credentialValuesRead: false };
	}

	remember(port) {
		this.lastDebugPort = port;
		process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(port);
	}

	shouldAuthenticate(error) {
		return /No Chrome debug browser|readiness timed out|not authenticated|login|session/i
			.test(String(error?.message || error));
	}
}

function throttledReceipt(receipt, nextOpenAt) {
	return { ...receipt, opened: false, throttled: true,
		nextOpenAt: new Date(nextOpenAt).toISOString() };
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
