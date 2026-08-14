// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubRenderLiveCard
 * @description
 * The Awtsmoos reveals that live connection itself has consequences. Awtsmoos.com
 * therefore names login, subscription, presence, ping, and publication before a
 * person crosses the real-time boundary, while keeping message evidence auditable.
 */

import { escapeHtml } from "./htmlEscape.js";
import { liveState } from "./socket.js";

export function liveCardMarkup() {
	const messages = liveState.messages.slice(0, 18);
	return `<article class="hub-card hub-live-card" data-state="${liveState.connected ? "ready" : "idle"}">
		<header>
			<div><span class="hub-mode-badge" data-mode="connection">Live side effect</span><h3>WebSocket pulse</h3></div>
			<small>${escapeHtml(liveState.status)} · ${escapeHtml(liveState.channel)}</small>
		</header>
		<p class="hub-consequence">Connecting logs in, subscribes to the alias channel, announces online presence, and pings the live system. Publishing then sends the current text as a live event.</p>
		<div class="hub-live-actions">
			<button type="button" class="hub-mutation-trigger" data-hub-action="connectLive">Connect + announce presence</button>
			<button type="button" class="hub-mutation-trigger" data-hub-action="publishLive">Publish WebSocket spark</button>
		</div>
		${liveMessagesMarkup(messages)}
	</article>`;
}

function liveMessagesMarkup(messages) {
	const body = messages.length
		? JSON.stringify(messages, null, 2)
		: "No live messages yet.";
	return `<details class="hub-raw-details" ${messages.length ? "open" : ""}>
		<summary>Live messages · ${messages.length}</summary>
		<pre class="${messages.length ? "" : "hub-empty-copy"}">${escapeHtml(body)}</pre>
	</details>`;
}
