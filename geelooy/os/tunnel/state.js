// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Runtime-only state for the Geelooy OS Virtual OS browser peer.
 * @description
 * The Awtsmoos lets this living tab know whether it is enabled, connected, or
 * reconnecting while remembered consent lives in a different vessel. Awtsmoos.com
 * persists only the friendly name here; runtime authority and future permission are
 * never written together by a single state mutation.
 */

import { PeerConsentMode } from "../../shared/tunnel/peerConsent.js";

const NAME_KEY = "awtsmoos.os.tunnel.name";

export class VirtualOsTunnelState {
	constructor(options = {}) {
		this.ws = null;
		this.name = options.name || rememberedName();
		this.enabled = Boolean(options.enabled);
		this.consentMode = options.consentMode || PeerConsentMode.DISABLED;
		this.sessionId = options.sessionId || createSessionId();
		this.connected = false;
		this.lastError = "";
		this.phase = this.enabled ? "offline" : "disabled";
	}

	setEnabled(enabled) {
		this.enabled = Boolean(enabled);
		if (!this.enabled) {
			this.connected = false;
			this.consentMode = PeerConsentMode.DISABLED;
			this.phase = "disabled";
		}
	}

	setConsentMode(mode) {
		this.consentMode = mode || PeerConsentMode.DISABLED;
	}

	markConnecting() {
		this.connected = false;
		this.lastError = "";
		this.phase = "connecting";
	}

	markConnected() {
		this.connected = true;
		this.lastError = "";
		this.phase = "connected";
	}

	markReconnecting() {
		this.connected = false;
		this.phase = "reconnecting";
	}

	markDisconnected() {
		this.connected = false;
		this.phase = this.enabled ? "offline" : "disabled";
	}

	markError(error) {
		this.connected = false;
		this.lastError = String(error || "virtual_os_tunnel_error");
		this.phase = "error";
	}

	snapshot() {
		return Object.freeze({
			name: this.name,
			enabled: this.enabled,
			consentMode: this.consentMode,
			sessionId: this.sessionId,
			connected: this.connected,
			lastError: this.lastError,
			phase: this.phase
		});
	}
}

export const tunnelState = new VirtualOsTunnelState();

export function rememberTunnelName(name) {
	tunnelState.name = String(name || tunnelState.name);
	storage()?.setItem(NAME_KEY, tunnelState.name);
}

export function rememberEnabled(enabled) {
	tunnelState.setEnabled(enabled);
}

export function websocketUrl() {
	const protocol = globalThis.location?.protocol === "https:" ? "wss:" : "ws:";
	const host = globalThis.location?.host || "localhost";
	return `${protocol}//${host}/api/tunnel`;
}

function rememberedName() {
	return storage()?.getItem(NAME_KEY) || "virtual-os-browser";
}

function createSessionId() {
	return `vos_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

function storage() {
	try {
		return globalThis.localStorage || null;
	} catch (_error) {
		return null;
	}
}
