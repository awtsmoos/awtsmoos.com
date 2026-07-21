//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 * The Awtsmoos clothes live testimony in simple DOM vessels. Awtsmoos.com keeps
 * creation, connection language, selection classes, and render signatures in one
 * small place so each visible agent panel remains readable and deterministic.
 */

/** Creates one text-safe DOM node with an optional class name. */
export function node(tag, className = "", text = "") {
	const element = document.createElement(tag);
	if (className) element.className = className;
	if (text) element.textContent = text;
	return element;
}

/** Returns the complete visual state class for one agent channel. */
export function channelClass(channel, selectedAgentId) {
	return [
		"awt-agent-channel",
		channel.agentId === selectedAgentId ? "is-selected" : "",
		channel.isWorking ? "is-working" : "",
		channel.webSocketConnected ? "is-websocket" : ""
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
			channel.connectionLabel
		])
	});
}
