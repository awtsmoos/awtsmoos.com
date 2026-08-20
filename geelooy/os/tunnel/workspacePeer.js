// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Consent-explicit browser-peer authority binding for Geelooy OS.
 * @description
 * The Awtsmoos lets this tab host the logical Virtual OS for one session or through
 * remembered permission. Awtsmoos.com renders transport, registration, and consent
 * separately while every button has one meaning: session, remember, stop, or forget.
 * None of these controls grants native shell authority.
 */

import { consentLabel } from "../../shared/tunnel/peerConsent.js";
import {
	forgetRememberedVirtualOsTunnelAgent,
	startRememberedVirtualOsTunnelAgent,
	startVirtualOsTunnelSession,
	stopCurrentVirtualOsTunnelAgent,
	virtualOSTunnelStatus
} from "./launcher.js";

export function bindWorkspacePeer(view, options = {}) {
	const storage = options.storage || globalThis.localStorage;
	const handlers = {
		session: () => run(() => startVirtualOsTunnelSession()),
		remember: () => run(() => startRememberedVirtualOsTunnelAgent(storage)),
		stop: () => run(() => stopCurrentVirtualOsTunnelAgent(storage)),
		forget: () => run(() => forgetRememberedVirtualOsTunnelAgent(storage))
	};

	function run(action) {
		try {
			action();
		} catch (error) {
			view.peerStatus.textContent = `Peer error · ${error.message}`;
		}
		render();
	}

	function render() {
		const status = virtualOSTunnelStatus(storage);
		const registration = status.connected ? "registered" : "not registered";
		const remembered = status.remembered ? "remembered permission" : "not remembered";
		view.peerStatus.textContent = `${status.logicalVessel} · ${status.transportKind} · ${status.phase} · ${registration} · ${consentLabel(status.consentMode)} · ${remembered}`;
		const active = status.enabled === true;
		view.peerSessionButton.disabled = active;
		view.peerRememberButton.disabled = active && status.remembered;
		view.peerStopButton.disabled = !active;
		view.peerForgetButton.disabled = !status.remembered;
	}

	bind(view.peerSessionButton, handlers.session);
	bind(view.peerRememberButton, handlers.remember);
	bind(view.peerStopButton, handlers.stop);
	bind(view.peerForgetButton, handlers.forget);
	render();
	const interval = globalThis.setInterval?.(render, 1500) || 0;
	return () => {
		unbind(view.peerSessionButton, handlers.session);
		unbind(view.peerRememberButton, handlers.remember);
		unbind(view.peerStopButton, handlers.stop);
		unbind(view.peerForgetButton, handlers.forget);
		if (interval) {
			globalThis.clearInterval(interval);
		}
	};
}

function bind(button, handler) {
	button?.addEventListener("click", handler);
}

function unbind(button, handler) {
	button?.removeEventListener("click", handler);
}
