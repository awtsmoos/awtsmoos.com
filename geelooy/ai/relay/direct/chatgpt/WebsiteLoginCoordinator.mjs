//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../split-browser/config.cjs");
const { openDebugChrome } = require("../../split-browser/cdpChrome.cjs");
const { ManualLoginGate } = require("../../split-browser/commands/ManualLoginGate.cjs");

/**
 * Missing website authentication opens one visible ChatGPT login chamber. The
 * human signs in manually; the gate detects only the redacted session verdict,
 * closes the login window, and reopens the same profile for ordinary website use.
 */
export class WebsiteLoginCoordinator {
	constructor({
		configFactory = loadConfig,
		gateFactory = () => new ManualLoginGate(),
		openBrowser = openDebugChrome
	} = {}) {
		this.configFactory = configFactory;
		this.gateFactory = gateFactory;
		this.openBrowser = openBrowser;
	}

	async authenticate() {
		const config = this.configFactory();
		const login = await this.gateFactory().authenticate(config);
		const reopened = await this.openBrowser({
			...config,
			debugPort: login.debugPort,
			launchUrl: config.targetOrigin || "https://chatgpt.com"
		});
		if (!reopened.ok) {
			const error = new Error("Authenticated ChatGPT profile could not be reopened.");
			error.code = "authenticated_profile_reopen_failed";
			throw error;
		}
		process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(login.debugPort);
		return {
			ok: true,
			debugPort: login.debugPort,
			browserReopened: true
		};
	}

	shouldAuthenticate(error) {
		return /No Chrome debug browser|readiness timed out|not authenticated|login|session/i
			.test(String(error?.message || error));
	}
}
