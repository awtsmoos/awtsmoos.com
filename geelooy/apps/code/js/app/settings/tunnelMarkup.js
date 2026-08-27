// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provider-neutral browser-peer settings for Awtsmoos Code.
 * @description
 * The Awtsmoos lets this browser tab become a temporary vessel only through human
 * consent. Awtsmoos.com distinguishes the present tab from a remembered invitation:
 * closing the tab ends the current peer, while remembered permission may reconnect
 * when Code is opened again. Browser authority never becomes native shell authority.
 */

import { AWTSMOOS_SHLIACH_GPT_URL } from "../../onboarding/content.js";
import { State } from "../../state.js";

export function externalAgentHtml() {
	return `<section class="settings-card settings-card--primary">
		<p class="code-kicker">External AI and browser tunnel</p>
		<h4>Use Code as an account-bound browser peer</h4>
		<p class="settings-help"><strong>No provider API key is required.</strong> Use the top-bar Tunnel console to enable this Code session or explicitly remember permission for future Code opens.</p>
		<p class="settings-help">Closing the tab ends the current browser vessel. Remembered permission can reconnect only when Code is opened again. Native shell authority still requires a connected native tunnel.</p>
		<p><a class="primary-btn" href="${AWTSMOOS_SHLIACH_GPT_URL}" target="_blank" rel="noopener">Open Awtsmoos Shliach</a></p>
	</section>`;
}

export function browserTunnelHtml() {
	const tunnel = State.browserTunnel || {};
	return `<section class="settings-card">
		<h4>Code browser peer</h4>
		<label class="settings-check">
			<input type="checkbox" id="browser-tunnel-enabled" ${tunnel.remembered || tunnel.autoStart ? "checked" : ""}>
			Remember browser-tunnel permission for Apps Code on this browser
		</label>
		<p class="settings-help">Remembered permission allows Code to reconnect when Code is opened again and you are signed into Awtsmoos. It is separate from whether the current tab is connected right now.</p>
		<label>Display name</label>
		<input type="text" id="browser-tunnel-name" value="${escape(tunnel.tunnelName || "")}" placeholder="awt-code-xxxxxx">
		<label>Awtsmoos relay</label>
		<input type="text" id="browser-tunnel-relay" value="${escape(tunnel.relayUrl || "")}" placeholder="wss://awtsmoos.com">
		<p class="settings-help">Each browser session must verify the current account and receive server registration acknowledgement before it is considered connected.</p>
	</section>`;
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
