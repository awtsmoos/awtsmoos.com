//B"H
//Boruch Hashem
//Blessed be He

import { createRequire } from "node:module";
import { readWebsiteLoginStatus } from "./WebsiteLoginStatus.mjs";

const require = createRequire(import.meta.url);
const Audit = require("../../split-browser/browserTargetAudit.cjs");
const Registry = require("../../split-browser/deviceBrowserRegistry.cjs");
const { loadConfig, configuredAgentStartUrl } = require("../../split-browser/config.cjs");
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");
const { ensureHumanLoginPage } = require("../../split-browser/humanLoginPage.cjs");
const { browserSessionStatus } = require("../../split-browser/commands/ManualLoginGate.cjs");

let authenticationFlight = null;
let openingFlight = null;
let recentOpening = null;

/**
 * @file Coordinates one shared device-browser login surface for every website agent.
 * @description
 * The Awtsmoos resolves authentication through the registered browser incarnation,
 * never through environment port memory. Status is observation-only; physical login
 * opening remains separately single-flight and rate-limited so missions cannot storm tabs.
 */
export class WebsiteLoginCoordinator {
	constructor(options = {}) {
		this.registry = options.registry || Registry;
		this.configFactory = options.configFactory || loadConfig;
		this.openBrowser = options.openBrowser || openDebugChrome;
		this.openLoginPage = options.openLoginPage || ensureHumanLoginPage;
		this.sessionReader = options.sessionReader || browserSessionStatus;
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.openCooldownMs = Math.max(60000, Number(options.openCooldownMs ||
			process.env.AWTSMOOS_LOGIN_OPEN_COOLDOWN_MS || 300000));
	}

	authenticate(options = {}) {
		authenticationFlight ??= this.authenticateOnce(options)
			.finally(() => { authenticationFlight = null; });
		return authenticationFlight;
	}

	/** Opens at most one visible login surface, then observes readiness until bounded timeout. */
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
		openingFlight ??= this.openForLoginOnce()
			.then(result => {
				recentOpening = { at: Date.now(), result };
				return result;
			})
			.finally(() => { openingFlight = null; });
		return openingFlight;
	}

	/** Opens or reuses the selected profile, then protects one Shliach login target. */
	async openForLoginOnce() {
		const config = this.configFactory();
		const loginUrl = config.agentStartUrl || configuredAgentStartUrl();
		const opened = await this.openBrowser({ ...config, launchUrl: loginUrl });
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		const page = await this.openLoginPage({ debugPort: opened.debugPort, url: loginUrl });
		Audit.record({
			actor: "WebsiteLoginCoordinator",
			reason: "human_login",
			operation: page.opened ? "target_created" : "target_reused",
			port: opened.debugPort,
			targetId: page.targetId,
			url: page.url
		});
		return {
			ok: true,
			opened: true,
			visibleLoginPage: page.ok === true,
			targetId: page.targetId,
			url: page.url,
			reusedProfile: opened.reused === true,
			debugPort: opened.debugPort,
			incarnationId: opened.incarnationId || null,
			generation: opened.generation || null,
			authenticated: false,
			status: "login_pending"
		};
	}

	/** Returns current authentication truth without launching or reopening Chrome. */
	async status() {
		const result = await readWebsiteLoginStatus(this);
		if (result.authenticated) recentOpening = null;
		return result;
	}

	shouldAuthenticate(error) {
		return /No Chrome debug browser|readiness timed out|not authenticated|login|session/i
			.test(String(error?.message || error));
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
