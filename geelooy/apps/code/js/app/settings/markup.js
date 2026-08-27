// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes Code settings while keeping browser-tunnel authority separate.
 * @description
 * The Awtsmoos joins editor, runtime, relay, preview, SSH, and optional AI keys
 * without confusing them. Awtsmoos.com delegates browser-peer consent to its own
 * module so provider-neutral tunnel language stays clear and independently tested.
 */

import { State } from "../../state.js";
import { ModelManager } from "../../vibe/model-manager.js";
import { profilesHtml } from "./ssh.js";
import {
	browserTunnelHtml,
	externalAgentHtml
} from "./tunnelMarkup.js";

export function settingsHtml() {
	return `<div class="code-settings-shell">
		${externalAgentHtml()}
		${browserTunnelHtml()}
		${runtimeHtml()}
		${generalHtml()}
		${relayHtml()}
		${previewHtml()}
		${sshHtml()}
		${editorHtml()}
		${providerHtml()}
	</div>`;
}

function runtimeHtml() {
	return `<section class="settings-card">
		<h4>Node and npm runtime</h4>
		<p class="settings-help">The browser runs CommonJS Node programs in Web Workers with the Code virtual filesystem, node_modules resolution, core shims, npm init/run/list, and preview-network routing.</p>
		<p class="settings-help">Native binaries, native addons, and the device's real npm executable require a separately connected native tunnel.</p>
	</section>`;
}

function generalHtml() {
	return `<section class="settings-card">
		<h4>General</h4>
		<label>GitHub Personal Access Token</label>
		<input type="password" id="github-token-input" value="${escape(State.githubToken || "")}" placeholder="ghp_...">
	</section>`;
}

function relayHtml() {
	return `<section class="settings-card">
		<div class="settings-title-row">
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
	return `<section class="settings-card">
		<h4>HTML Preview Engine</h4>
		<p class="settings-help">Iframe previews become browser-automation targets. Merkava remains available for synthetic diagnostics.</p>
		<select id="preview-engine-select">
			<option value="merkava" ${engine === "merkava" ? "selected" : ""}>Merkava synthetic DOM only</option>
			<option value="iframe" ${engine === "iframe" ? "selected" : ""}>Sandbox iframe only</option>
			<option value="both" ${engine === "both" ? "selected" : ""}>Iframe + Merkava diagnostics</option>
		</select>
	</section>`;
}

function sshHtml() {
	return `<section class="settings-card">
		<div class="settings-title-row">
			<h4>SSH Workspaces and Keys</h4>
			<button id="settings-add-ssh-profile" class="secondary-btn" type="button">Add SSH Profile</button>
		</div>
		<div id="ssh-profiles-settings">${profilesHtml(State.sshProfiles || [])}</div>
	</section>`;
}

function editorHtml() {
	return `<section class="settings-card">
		<h4>Editor</h4>
		<label class="settings-check"><input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? "checked" : ""}> Use tab characters for indentation</label>
	</section>`;
}

function providerHtml() {
	return `<details class="settings-card settings-provider-details">
		<summary><strong>Optional built-in AI provider keys</strong></summary>
		<p class="settings-help">These keys power AI Studio inside Code. They are unrelated to external-agent browser-tunnel authorization.</p>
		${ModelManager.getSettingsPanelHTML()}
	</details>`;
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
