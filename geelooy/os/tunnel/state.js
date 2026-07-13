// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives the Geelooy OS tunnel one durable state vessel. Legacy
 * helpers and the class-based agent share the same Awtsmoos.com memory.
 */

const NAME_KEY = "awtsmoos.os.tunnel.name";
const ENABLED_KEY = "awtsmoos.os.tunnel.enabled";

export class VirtualOsTunnelState {
	constructor(options = {}) {
		this.ws = null;
		this.name = options.name || rememberedName();
		this.enabled = options.enabled ?? rememberedEnabled();
		this.sessionId = options.sessionId || createSessionId();
		this.connected = false;
		this.lastError = "";
		this.phase = this.enabled ? "offline" : "disabled";
	}

	setEnabled(enabled) {
		this.enabled = Boolean(enabled);
		storage()?.setItem(ENABLED_KEY, this.enabled ? "1" : "0");
		if (!this.enabled) {
			this.connected = false;
			this.phase = "disabled";
		}
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

function rememberedEnabled() {
	return storage()?.getItem(ENABLED_KEY) === "1";
}

function createSessionId() {
	const timePart = Date.now().toString(36);
	const randomPart = Math.random().toString(36).slice(2, 9);
	return `vos_${timePart}_${randomPart}`;
}

function storage() {
	try {
		return globalThis.localStorage || null;
	} catch (_error) {
		return null;
	}
}
