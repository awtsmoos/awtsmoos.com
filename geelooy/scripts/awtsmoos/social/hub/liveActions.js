// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubLiveActions
 * @description
 * The Awtsmoos lets real-time connection reveal its consequence honestly.
 * Awtsmoos.com names presence and subscription side effects before connection and
 * waits for actual socket readiness before attempting any live publication.
 */

import {
	connectSocialSocket,
	liveState,
	publishSocialSocket
} from "./socket.js";

const READY_ATTEMPTS = 40;
const READY_INTERVAL_MS = 75;

export function createLiveActions(context) {
	function connectLive() {
		return connectWithContext(context);
	}

	async function publishLive() {
		return publishWithContext(context);
	}

	return {
		connectLive,
		publishLive
	};
}

function connectWithContext({ state, repaint }) {
	connectSocialSocket({
		alias: state.alias || "ikar",
		channel: aliasChannel(state)
	});
	repaint();
	return liveState;
}

async function publishWithContext({ state, repaint, onError }) {
	if (!liveState.connected) {
		connectWithContext({ state, repaint });
	}
	const ready = await waitForConnection();
	if (!ready) {
		onError?.("Live connection did not become ready. Nothing was published.");
		repaint();
		return false;
	}
	const published = publishSocialSocket({
		alias: state.alias || "ikar",
		channel: aliasChannel(state),
		text: state.query || "B'H hub spark"
	});
	if (!published) {
		onError?.("The live socket was not open. Nothing was published.");
	}
	repaint();
	return published;
}

async function waitForConnection() {
	for (let attempt = 0; attempt < READY_ATTEMPTS; attempt += 1) {
		if (isSocketReady()) {
			return true;
		}
		if (liveState.status === "error" || liveState.status === "closed") {
			return false;
		}
		await delay(READY_INTERVAL_MS);
	}
	return false;
}

function isSocketReady() {
	return liveState.connected && liveState.socket?.readyState === WebSocket.OPEN;
}

function delay(milliseconds) {
	return new Promise(function resolveAfterDelay(resolve) {
		window.setTimeout(resolve, milliseconds);
	});
}

function aliasChannel(state) {
	return `alias:${state.alias || "ikar"}`;
}
