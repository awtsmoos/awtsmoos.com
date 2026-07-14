// B"H
// Boruch Hashem
// Blessed is He

import { capabilityLines, nodeCapabilityReport } from "../node/capabilities.js";

export const AWTSMOOS_SHLIACH_GPT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";
export const TUNNEL_CONTROL_URL = "/apps/tunnel-control/";
export const WINDOWS_INSTALL_COMMAND = "irm https://awtsmoos.com/api/tunnel/install/windows | iex";
export const UNIX_INSTALL_COMMAND = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";

/**
 * B"H
 *
 * First-run language separates the public GPT, this browser tunnel, optional
 * built-in providers, and native device execution. The Awtsmoos renews every
 * path without confusion; Awtsmoos.com never asks for Gemini to open ChatGPT.
 */
export function welcomeMarkup(options = {}) {
	const runtime = nodeCapabilityReport({
		nativeTunnel: Boolean(options.nativeTunnel)
	});
	return `
		<section class="code-welcome" data-code-welcome>
			<header class="code-welcome__hero">
				<p class="code-kicker">B\"H · Awtsmoos Code</p>
				<h1>Open this editor. Let the Awtsmoos Shliach work through it.</h1>
				<p>This browser tab can be a live coding tunnel for the public ChatGPT app. <strong>No Gemini API key is required.</strong></p>
				<div class="code-welcome__hero-actions">
					<a class="code-primary-action" href="${AWTSMOOS_SHLIACH_GPT_URL}" target="_blank" rel="noopener" data-welcome-action="open-gpt">Open the Awtsmoos Shliach GPT</a>
					<button type="button" data-welcome-action="start-tunnel">Start this browser tunnel</button>
					<button type="button" data-welcome-action="show-console">Watch live agent actions</button>
				</div>
			</header>
			<div class="code-welcome__modes">
				${modeCard("1", "Public ChatGPT agent", "Open the linked GPT, keep this Code tab open, and tell it to use the browser Code tunnel. No provider key is needed.", "Recommended")}
				${modeCard("2", "Browser Code tunnel", "The editor registers one tunnel socket and safely multiplexes many logical agents, missions, browser actions, filesystem requests, and simulated commands.", "No install")}
				${modeCard("3", "Native device tunnel", "Install the local agent only when ChatGPT needs your real filesystem, native Node/npm, Chrome, processes, or terminal commands.", "Optional")}
				${modeCard("4", "Built-in AI providers", "Gemini and other API keys power AI features inside the Code app itself. They are separate from ChatGPT tunnel mode and always optional.", "Optional keys")}
			</div>
			<section class="code-welcome__steps">
				<h2>Fastest path</h2>
				<ol>
					<li>Keep this Code tab open and press <strong>Start this browser tunnel</strong>.</li>
					<li>Open the public GPT using the bright button above.</li>
					<li>Tell the GPT what to build and mention the Code editor tab. Its live actions appear in the Agent Console.</li>
					<li>For native device access, run the installer below once; rerun the same command whenever the agent needs refreshing.</li>
				</ol>
			</section>
			<section class="code-welcome__installers">
				${commandCard("macOS / Linux", UNIX_INSTALL_COMMAND)}
				${commandCard("Windows PowerShell", WINDOWS_INSTALL_COMMAND)}
				<a href="${TUNNEL_CONTROL_URL}" target="_blank" rel="noopener">Open the full Tunnel Control app</a>
			</section>
			<section class="code-welcome__runtime">
				<h2>Node and npm in this editor</h2>
				<ul>${capabilityLines(runtime).map(line => `<li>${escape(line)}</li>`).join("")}</ul>
				<p>Browser emulation and native delegation are shown separately so unsupported native addons are never mistaken for a working browser feature.</p>
			</section>
			<footer class="code-welcome__footer">
				<button type="button" data-welcome-action="provider-settings">Optional built-in AI provider settings</button>
				<button type="button" data-welcome-action="dismiss">Continue to the editor</button>
			</footer>
		</section>`;
}

function modeCard(number, title, description, badge) {
	return `<article class="code-mode-card"><span>${escape(number)}</span><div><header><h2>${escape(title)}</h2><small>${escape(badge)}</small></header><p>${escape(description)}</p></div></article>`;
}

function commandCard(title, command) {
	return `<article class="code-command-card"><strong>${escape(title)}</strong><code>${escape(command)}</code><button type="button" data-copy-command="${escape(command)}">Copy</button></article>`;
}

function escape(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[character]);
}
