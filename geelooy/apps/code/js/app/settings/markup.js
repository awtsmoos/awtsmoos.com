// B"H
// Boruch Hashem
// Blessed is He

import { AWTSMOOS_SHLIACH_GPT_URL } from "../../onboarding/content.js";
import { State } from "../../state.js";
import { ModelManager } from "../../vibe/model-manager.js";
import { profilesHtml } from "./ssh.js";

/**
 * B"H
 *
 * Settings separates ChatGPT tunnel mode from optional built-in provider keys.
 * The Awtsmoos renews both paths without confusion; Awtsmoos.com never presents
 * Gemini credentials as a prerequisite for the public Awtsmoos Shliach GPT.
 */
export function settingsHtml() {
	return `<div class="code-settings-shell">
		${chatGptTunnelHtml()}
		${tunnelHtml()}
		${runtimeHtml()}
		${generalHtml()}
		${relayHtml()}
		${previewHtml()}
		${sshHtml()}
		${editorHtml()}
		${providerHtml()}
	</div>`;
}

function chatGptTunnelHtml() {
	return `<section class="settings-card settings-card--primary">
		<p class="code-kicker">Use Code with ChatGPT</p>
		<h4>Awtsmoos Shliach browser tunnel</h4>
		<p class="settings-help"><strong>No Gemini API key is required.</strong> Keep this Code tab open, enable the browser tunnel below, and use the public GPT.</p>
		<p><a class="primary-btn" href="${AWTSMOOS_SHLIACH_GPT_URL}" target="_blank" rel="noopener">Open the Awtsmoos Shliach GPT</a></p>
		<p class="settings-help">Built-in model keys appear at the bottom only for AI features that run inside Code itself.</p>
	</section>`;
}

function tunnelHtml() {
	const tunnel = State.browserTunnel || {};
	return `<section class="settings-card"><h4>Browser Code Tunnel</h4>
		<label class="settings-check"><input type="checkbox" id="browser-tunnel-enabled" ${tunnel.autoStart ? "checked" : ""}> Start this tab as a tunnel whenever Code opens</label>
		<label>Tunnel name</label>
		<input type="text" id="browser-tunnel-name" value="${escape(tunnel.tunnelName || "")}" placeholder="awt-code-xxxxxx">
		<label>Awtsmoos relay</label>
		<input type="text" id="browser-tunnel-relay" value="${escape(tunnel.relayUrl || "")}" placeholder="wss://awtsmoos.com">
		<p class="settings-help">One browser socket supports multiple logical agents and missions. Live actions appear from the top-bar tunnel button.</p>
	</section>`;
}

function runtimeHtml() {
	return `<section class="settings-card"><h4>Node and npm runtime</h4>
		<p class="settings-help">The browser runs CommonJS Node programs in Web Workers with the Code virtual filesystem, node_modules resolution, core shims, npm init/run/list, and preview-network routing.</p>
		<p class="settings-help">Native binaries, native addons, and the device's real npm executable require the separately installed native tunnel.</p>
	</section>`;
}

function generalHtml() {
	return `<section class="settings-card"><h4>General</h4>
		<label>GitHub Personal Access Token</label>
		<input type="password" id="github-token-input" value="${escape(State.githubToken || "")}" placeholder="ghp_...">
	</section>`;
}

function relayHtml() {
	return `<section class="settings-card"><div class="settings-title-row">
		<h4>Filesystem Relay Server</h4>
		<button id="settings-dl-relay-btn" class="primary-btn" type="button">Download Script</button>
	</div>
	<input type="text" id="relay-url-input" value="${escape(State.relayUrl || "")}" placeholder="http://localhost:3000">
	<details><summary>API and CORS requirements</summary><pre>Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
action=list/read/write/mkdir/delete/download-md</pre></details>
	</section>`;
}

function previewHtml() {
	const engine = State.previewEngine || "merkava";
	return `<section class="settings-card"><h4>HTML Preview Engine</h4>
		<p class="settings-help">Iframe previews become browser-automation targets. Merkava remains available for synthetic diagnostics.</p>
		<select id="preview-engine-select">
			<option value="merkava" ${engine === "merkava" ? "selected" : ""}>Merkava synthetic DOM only</option>
			<option value="iframe" ${engine === "iframe" ? "selected" : ""}>Sandbox iframe only</option>
			<option value="both" ${engine === "both" ? "selected" : ""}>Iframe + Merkava diagnostics</option>
		</select>
	</section>`;
}

function sshHtml() {
	return `<section class="settings-card"><div class="settings-title-row">
		<h4>SSH Workspaces and Keys</h4>
		<button id="settings-add-ssh-profile" class="secondary-btn" type="button">Add SSH Profile</button>
	</div><div id="ssh-profiles-settings">${profilesHtml(State.sshProfiles || [])}</div></section>`;
}

function editorHtml() {
	return `<section class="settings-card"><h4>Editor</h4>
		<label class="settings-check"><input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? "checked" : ""}> Use tab characters for indentation</label>
	</section>`;
}

function providerHtml() {
	return `<details class="settings-card settings-provider-details"><summary><strong>Optional built-in AI provider keys</strong></summary>
		<p class="settings-help">These settings power AI Studio inside Code. They are unrelated to the public ChatGPT tunnel.</p>
		${ModelManager.getSettingsPanelHTML()}
	</details>`;
}

function escape(value) {
	return String(value ?? "").replace(/[&<>"']/g, character => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
	})[character]);
}
