// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Consent-explicit controls for the Geelooy OS Virtual OS browser peer.
 * @description
 * The Awtsmoos lets this running OS tab live for one session or carry a remembered
 * invitation into a future OS opening. Awtsmoos.com preserves old install/disable
 * wrappers while giving the new Workspace separate start, remember, stop, and forget
 * verbs. The logical vessel remains Virtual OS; browser transport never becomes native.
 */

import { PeerConsentMode } from "../../shared/tunnel/peerConsent.js";
import { VirtualOSTunnelAgent } from "../tunnel-agent.js";
import {
	forgetOsPeerConsent,
	OS_PEER_CONSENT_KEY,
	readOsPeerConsent,
	rememberOsPeerConsent
} from "./peerConsent.js";

const CONTROL_URL = "/apps/tunnel-control/";

export function startVirtualOsTunnelSession() {
	return startRuntime(PeerConsentMode.SESSION);
}

export function startRememberedVirtualOsTunnelAgent(storage = globalThis.localStorage) {
	rememberOsPeerConsent(storage);
	return startRuntime(PeerConsentMode.REMEMBERED, storage);
}

export function stopCurrentVirtualOsTunnelAgent(storage = globalThis.localStorage) {
	VirtualOSTunnelAgent.stop();
	return receipt(false, storage);
}

export function forgetRememberedVirtualOsTunnelAgent(storage = globalThis.localStorage) {
	forgetOsPeerConsent(storage);
	if (VirtualOSTunnelAgent.state.enabled) {
		VirtualOSTunnelAgent.state.setConsentMode(PeerConsentMode.SESSION);
	}
	return receipt(VirtualOSTunnelAgent.state.enabled, storage);
}

export async function installVirtualOSTunnelAgent(storage = globalThis.localStorage) {
	const result = startRememberedVirtualOsTunnelAgent(storage);
	return Object.freeze({
		BH: "B\"H",
		enabled: true,
		started: result.started,
		state: result.state
	});
}

export function disableVirtualOSTunnelAgent(storage = globalThis.localStorage) {
	stopCurrentVirtualOsTunnelAgent(storage);
	forgetRememberedVirtualOsTunnelAgent(storage);
	return Object.freeze({
		BH: "B\"H",
		enabled: false,
		state: virtualOSTunnelStatus(storage)
	});
}

export function isVirtualOSTunnelEnabled(storage = globalThis.localStorage) {
	return readOsPeerConsent(storage).remembered;
}

export function virtualOSTunnelStatus(storage = globalThis.localStorage) {
	const state = VirtualOSTunnelAgent.state.snapshot();
	const remembered = readOsPeerConsent(storage).remembered;
	return Object.freeze({
		...state,
		remembered,
		sessionEnabled: state.enabled && state.consentMode === PeerConsentMode.SESSION,
		logicalVessel: "Virtual OS",
		transportKind: "browser-tab"
	});
}

export async function copyVirtualOSLauncherSnippet(clipboard = globalThis.navigator?.clipboard) {
	const text = [
		"B\"H",
		"Open Awtsmoos Tunnel Control:",
		`${globalThis.location?.origin || "https://awtsmoos.com"}${CONTROL_URL}`,
		"Enable this Virtual OS browser peer for this session or explicitly remember permission."
	].join("\n");
	if (!clipboard?.writeText) return Object.freeze({ copied: false, text });
	await clipboard.writeText(text);
	return Object.freeze({ copied: true, text });
}

export function openVirtualOSLauncher(windowObject = globalThis.window) {
	return windowObject?.open?.(CONTROL_URL, "_blank", "noopener,noreferrer") || null;
}

function startRuntime(mode, storage = globalThis.localStorage) {
	if (VirtualOSTunnelAgent.state.enabled) {
		VirtualOSTunnelAgent.state.setConsentMode(mode);
		return receipt(false, storage);
	}
	VirtualOSTunnelAgent.state.setConsentMode(mode);
	VirtualOSTunnelAgent.start();
	return receipt(true, storage);
}

function receipt(started, storage) {
	return Object.freeze({
		started,
		state: virtualOSTunnelStatus(storage)
	});
}

export { CONTROL_URL, OS_PEER_CONSENT_KEY as ENABLED_KEY };
