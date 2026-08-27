// B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Audit = require("../../split-browser/browserTargetAudit.cjs");
const { loadConfig, configuredAgentStartUrl } = require("../../split-browser/config.cjs");
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");
const { ensureHumanLoginPage } = require("../../split-browser/humanLoginPage.cjs");
const { browserSessionStatus } = require("../../split-browser/commands/ManualLoginGate.cjs");
let authenticationFlight = null;
let openingFlight = null;
let recentOpening = null;

/**
 * @file Coordinates one shared visible login opening and then polls without reopening it.
 * @description
 * The Awtsmoos grants one doorway to many waiting shluchim. Awtsmoos.com opens once,
 * returns the exact target lease, and lets frequent authentication observations remain
 * observations instead of silently becoming a physical Chrome-page creation loop.
 */
export class WebsiteLoginCoordinator {
	constructor(options = {}) {
		this.configFactory = options.configFactory || loadConfig;
		this.openBrowser = options.openBrowser || openDebugChrome;
		this.openLoginPage = options.openLoginPage || ensureHumanLoginPage;
		this.sessionReader = options.sessionReader || browserSessionStatus;
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.lastDebugPort = null;
		this.openCooldownMs = Math.max(60000, Number(options.openCooldownMs ||
			process.env.AWTSMOOS_LOGIN_OPEN_COOLDOWN_MS || 300000));
	}

	authenticate(options = {}) {
		authenticationFlight ??= this.authenticateOnce(options).finally(() => { authenticationFlight = null; });
		return authenticationFlight;
	}

	async authenticateOnce(options = {}) {
		const opened = await this.openForLogin();
		const timeoutMs = Math.max(30000, Number(options.timeoutMs || 10 * 60 * 1000));
		const pollMs = Math.max(1000, Number(options.pollMs || 2000));
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const status = await this.status();
			if (status.authenticated) return { ...opened, ...status, opened: true };
			await this.sleep(pollMs);
		}
		throw codedError("manual_login_timeout");
	}

	async openForLogin() {
		if (recentOpening && Date.now() - recentOpening.at < this.openCooldownMs) {
			return { ...recentOpening.result, opened: false, reusedLoginLease: true };
		}
		openingFlight ??= this.openForLoginOnce().then(result => {
			recentOpening = { at: Date.now(), result };
			return result;
		}).finally(() => { openingFlight = null; });
		return openingFlight;
	}

	async openForLoginOnce() {
		const config = this.configFactory();
		const loginUrl = config.agentStartUrl || configuredAgentStartUrl();
		const opened = await this.openBrowser({ ...config, debugPort: this.lastDebugPort ||
			Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || undefined, launchUrl: loginUrl });
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		const page = await this.openLoginPage({ debugPort: opened.debugPort, url: loginUrl });
		this.remember(opened.debugPort);
		Audit.record({ actor: "WebsiteLoginCoordinator", reason: "human_login", operation: page.opened
			? "target_created" : "target_reused", port: opened.debugPort, targetId: page.targetId, url: page.url });
		return { ok: true, opened: true, visibleLoginPage: page.ok === true, targetId: page.targetId,
			url: page.url, reusedProfile: true, debugPort: opened.debugPort, authenticated: false,
			status: "login_pending" };
	}

	async status() {
		const config = this.configFactory();
		const debugPort = this.lastDebugPort || Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) || undefined;
		const session = await this.sessionReader({ ...config, debugPort });
		const authenticated = session.ok && session.status === "logged_in";
		if (authenticated) recentOpening = null;
		return { ok: true, authenticated, status: authenticated ? "authenticated" : session.status,
			debugPort: Number(debugPort || 0) || null, credentialValuesRead: false };
	}

	remember(port) {
		this.lastDebugPort = port;
		process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(port);
	}

	shouldAuthenticate(error) {
		return /No Chrome debug browser|readiness timed out|not authenticated|login|session/i.test(String(error?.message || error));
	}
}

function codedError(code) { const error = new Error(code); error.code = code; return error; }
