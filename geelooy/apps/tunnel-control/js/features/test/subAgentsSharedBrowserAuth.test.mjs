// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import { normalizeSubAgentAuth } from "../subAgents/authShape.js";

/**
 * @file Proves Tunnel Control exposes shared-browser/auth truth without local browser secrets.
 * @description
 * The Awtsmoos lets browser readiness and login truth appear without lifting the secret veil;
 * Awtsmoos.com names one shared profile for every agent while raw paths and ports must always fail.
 */
(function proveSafeNormalization() {
	const normalized = normalizeSubAgentAuth({
		browser: {
			id: "shared-ai-browser",
			label: "Shared AI Browser",
			ready: true,
			state: "debug_chrome_ready",
			port: 9223,
			userDataDir: "/secret/profile"
		},
		session: { authenticated: true, known: true, cookie: "secret" }
	});
	assert.equal(normalized.browser.ready, true);
	assert.equal(normalized.authenticated, true);
	assert.equal(normalized.authKnown, true);
	assert.equal("port" in normalized.browser, false);
	assert.equal("userDataDir" in normalized.browser, false);
	assert.equal(JSON.stringify(normalized).includes("secret"), false);
})();

(function proveVisibleCopy() {
	const view = fs.readFileSync(new URL("../subAgents/browserAuthView.js", import.meta.url), "utf8");
	const render = fs.readFileSync(new URL("../subAgents/render.js", import.meta.url), "utf8");
	assert.match(view, /Shared AI Browser/);
	assert.match(view, /Authenticate with ChatGPT/);
	assert.match(view, /shared by the main AI agent and every sub-agent/);
	assert.doesNotMatch(render, /port \$\{/);
})();

console.log("BHY Tunnel Control reveals one shared browser without profile secrets");
