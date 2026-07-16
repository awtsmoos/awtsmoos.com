// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialHubIndex
 * @description
 * The Awtsmoos awakens the existing Social Hub through parallel API reads, one
 * render vessel, WebSocket life, and page presence—always inside `/api/social`.
 */

import { state, setBusy, setError, setResult } from "./state.js";
import { render } from "./render.js";
import { allKeys, groupKeys, requestForKey } from "./requestPlan.js";
import {
	connectSocialSocket,
	liveState,
	publishSocialSocket
} from "./socket.js";
import { mountPresenceBadge } from "../live/presenceBadge.js";

const root = document.getElementById("BH_SOCIAL_HUB");

function aliasChannel() {
	return `alias:${state.alias || "ikar"}`;
}

function pageChannel() {
	return `page:${location.pathname || "/social/"}`;
}

async function runKey(key) {
	const result = await requestForKey(key);
	setResult(key, result);
	return result;
}

async function runKeys(keys) {
	setBusy(true);
	setError("");
	repaint();
	try {
		await Promise.all(keys.map(runKey));
	} catch (error) {
		setError(error.message || String(error));
	} finally {
		setBusy(false);
		repaint();
	}
}

function runActive() {
	return runKeys(groupKeys(state.active));
}

function runAll() {
	return runKeys(allKeys());
}

function connectLive() {
	connectSocialSocket({
		alias: state.alias || "ikar",
		channel: aliasChannel()
	});
	repaint();
}

function publishLive() {
	if (!liveState.connected) {
		connectLive();
	}
	window.setTimeout(() => {
		publishSocialSocket({
			alias: state.alias || "ikar",
			channel: aliasChannel(),
			text: state.query || "B'H hub spark"
		});
		repaint();
	}, 120);
}

function repaint() {
	render(root, {
		repaint,
		runActive,
		runAll,
		connectLive,
		publishLive
	});
}

if (root) {
	window.addEventListener("BH_SOCIAL_SOCKET", repaint);
	mountPresenceBadge({
		aliasId: state.alias || "ikar",
		channel: pageChannel()
	});
	repaint();
	runActive();
}
