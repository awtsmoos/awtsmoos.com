// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Human-consent operations for the Apps Code browser tunnel.
 * @description
 * The Awtsmoos separates a present socket from a remembered invitation. Awtsmoos.com
 * gives Code four explicit verbs: live for this session, live and remember, stop this
 * living peer, and forget the future invitation. Runtime normalization lives here too,
 * so reconnect may renew transport without silently changing how long consent lasts.
 */

import { State } from "../state.js";
import { PeerConsentMode } from "../../../../shared/tunnel/peerConsent.js";
import { startBrowserTunnel, stopBrowserTunnel } from "./browser-agent-connection.js";
import { setBrowserTunnelRemembered } from "./browser-agent-state.js";

export function startBrowserTunnelSession(agent) {
	prepareRuntime(PeerConsentMode.SESSION);
	return startBrowserTunnel(agent);
}

export function startRememberedBrowserTunnel(agent) {
	setBrowserTunnelRemembered(true);
	prepareRuntime(PeerConsentMode.REMEMBERED);
	return startBrowserTunnel(agent);
}

export function startRememberedBrowserTunnelOnBoot(agent) {
	if (State.browserTunnel?.remembered !== true) {
		return agent.getStatus();
	}
	prepareRuntime(PeerConsentMode.REMEMBERED);
	return startBrowserTunnel(agent);
}

export function stopCurrentBrowserTunnel(agent) {
	return stopBrowserTunnel(agent);
}

export function forgetRememberedBrowserTunnel(agent) {
	setBrowserTunnelRemembered(false);
	if (State.browserTunnel?.enabled) {
		State.browserTunnel.consentMode = PeerConsentMode.SESSION;
	}
	agent.emitUpdate?.();
	return agent.getStatus();
}

export function markBrowserTunnelReplaced(agent) {
	State.browserTunnel.enabled = false;
	State.browserTunnel.consentMode = PeerConsentMode.DISABLED;
	clearTimeout(agent.reconnectTimer);
	agent.setStatus("replaced");
	agent.log("replaced", "Another browser tab now owns this tunnel name.");
}

export function ensureBrowserTunnelRuntimeConsent() {
	State.browserTunnel.enabled = true;
	if (isRuntimeMode(State.browserTunnel.consentMode)) {
		return State.browserTunnel.consentMode;
	}
	State.browserTunnel.consentMode = State.browserTunnel.remembered
		? PeerConsentMode.REMEMBERED
		: PeerConsentMode.SESSION;
	return State.browserTunnel.consentMode;
}

function prepareRuntime(mode) {
	State.browserTunnel.enabled = true;
	State.browserTunnel.consentMode = mode;
	State.browserTunnel.lastError = "";
}

function isRuntimeMode(mode) {
	return mode === PeerConsentMode.SESSION || mode === PeerConsentMode.REMEMBERED;
}
