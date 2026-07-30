//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../split-browser/config.cjs");
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");
const {
	ManualLoginGate,
	browserSessionStatus
} = require("../../split-browser/commands/ManualLoginGate.cjs");
let authenticationFlight = null;
let openingFlight = null;

/**
 * Authentication remains human-owned. A caller can either await a bounded manual
 * gate or open/reuse the visible profile and return immediately while useful work
 * continues elsewhere. Only a redacted logged-in verdict crosses this boundary.
 */
export class WebsiteLoginCoordinator {
	constructor({
		configFactory = loadConfig,
		gateFactory = () => new ManualLoginGate(),
		openBrowser = openDebugChrome,
		sessionReader = browserSessionStatus
	} = {}) {
		this.configFactory = configFactory;
		this.gateFactory = gateFactory;
		this.openBrowser = openBrowser;
		this.sessionReader = sessionReader;
		this.lastDebugPort = null;
	}

	async authenticate(options = {}) {
		authenticationFlight ??= this.authenticateOnce(options)
			.finally(() => {
				authenticationFlight = null;
			});
		return authenticationFlight;
	}

	async authenticateOnce(options = {}) {
		const config = this.configFactory();
		const login = await this.gateFactory().authenticate(config, options);
		const reopened = await this.openBrowser({
			...config,
			debugPort: login.debugPort,
			launchUrl: config.targetOrigin || "https://chatgpt.com"
		});
		if (!reopened.ok) {
			throw codedError("authenticated_profile_reopen_failed");
		}
		this.lastDebugPort = login.debugPort;
		process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(login.debugPort);
		return {
			ok: true,
			status: "authenticated",
			authenticated: true,
			debugPort: login.debugPort,
			browserReopened: true
		};
	}

	async openForLogin() {
		openingFlight ??= this.openForLoginOnce()
			.finally(() => {
				openingFlight = null;
			});
		return openingFlight;
	}

	async openForLoginOnce() {
		const config = this.configFactory();
		const opened = await this.openBrowser({
			...config,
			debugPort: this.lastDebugPort ||
				Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) ||
				undefined,
			launchUrl: config.targetOrigin || "https://chatgpt.com"
		});
		if (!opened.ok) throw codedError("debug_chrome_open_failed");
		this.lastDebugPort = opened.debugPort;
		process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(opened.debugPort);
		const status = await this.status();
		return {
			ok: true,
			opened: true,
			reusedProfile: true,
			debugPort: opened.debugPort,
			authenticated: status.authenticated,
			status: status.status
		};
	}

	async status() {
		const config = this.configFactory();
		const debugPort = this.lastDebugPort ||
			Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT || 0) ||
			undefined;
		const session = await this.sessionReader({ ...config, debugPort });
		const authenticated = session.ok && session.status === "logged_in";
		return {
			ok: true,
			authenticated,
			status: authenticated ? "authenticated" : session.status,
			debugPort: Number(debugPort || 0) || null,
			credentialValuesRead: false
		};
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
