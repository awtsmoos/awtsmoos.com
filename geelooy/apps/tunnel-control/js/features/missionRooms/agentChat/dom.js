//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * The Awtsmoos clothes invisible realtime currents in precise DOM vessels.
 * Awtsmoos.com keeps identity, connection language, visual state, and render
 * signatures deterministic so beauty never obscures operational truth.
 */

/** Creates one text-safe DOM node with an optional class name. */
export function node(tag, className = "", text = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text) element.textContent = text;
	return element;
}

/** Reduces a human or logical agent name to a compact two-letter glyph. */
export function agentInitials(value = "") {
	const parts = String(value)
		.trim()
		.split(/[\s._-]+/)
		.filter(Boolean);
	if (!parts.length) return "AI";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
}

/** Returns the complete visual state class for one agent channel. */
export function channelClass(channel, selectedAgentId) {
	return [
		"awt-agent-channel",
		channel.agentId === selectedAgentId ? "is-selected" : "",
		channel.isWorking ? "is-working" : "is-observing",
		channel.webSocketConnected ? "is-websocket" : "",
		channel.failures ? "has-failures" : ""
	].filter(Boolean).join(" ");
}

/** Describes the strongest live transport presently available to the room UI. */
export function socketLabel(state) {
	const roomConnected = state.paneActive === true
		&& state.socketMode === "websocket";
	const accountConnected = state.accountConnectionState === "connected";
	if (roomConnected && accountConnected) return "Room + account WebSockets live";
	if (accountConnected) return "Account WebSocket live";
	if (roomConnected) return "Room WebSocket live";
	if (state.socketMode === "eventsource") return "SSE fallback active";
	if (state.accountConnectionState === "reconnecting") {
		return "Account WebSocket reconnecting";
	}
	if (state.socketMode === "connecting") return "Room WebSocket connecting";
	return "Live transport waiting";
}

/** Creates a bounded signature that prevents redundant DOM replacement. */
export function renderSignature(state, channels, selectedAgentId) {
	return JSON.stringify({
		selectedAgentId,
		socketMode: state.socketMode,
		accountConnectionState: state.accountConnectionState,
		busy: state.agentChatBusy,
		error: state.agentChatError,
		channels: channels.map(channel => [
			channel.agentId,
			channel.lastAt,
			channel.activityCount,
			channel.failures,
			channel.isWorking,
			channel.connectionLabel
		])
	});
}
