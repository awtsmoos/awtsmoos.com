// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure browser-peer consent schema shared by Code and Geelooy OS.
 * @description
 * The Awtsmoos lets one remembered intention outlive a socket without confusing
 * memory with present authority. Awtsmoos.com names three runtime truths — disabled,
 * session, remembered — while this module persists nothing and knows no product.
 * Each vessel owns its storage; this pure law only interprets the human covenant.
 */

export const PEER_CONSENT_SCHEMA_VERSION = 1;

export const PeerConsentMode = Object.freeze({
	DISABLED: "disabled",
	SESSION: "session",
	REMEMBERED: "remembered"
});

export function normalizePeerConsent(raw) {
	if (raw === true || raw === "1" || raw === "true") {
		return rememberedPeerConsent();
	}
	if (!raw || raw === false || raw === "0" || raw === "false") {
		return disabledPeerConsent();
	}
	if (typeof raw !== "object") {
		return disabledPeerConsent();
	}
	if (raw.schemaVersion === PEER_CONSENT_SCHEMA_VERSION) {
		return raw.mode === PeerConsentMode.REMEMBERED
			? rememberedPeerConsent()
			: disabledPeerConsent();
	}
	if (raw.remembered === true || raw.autoStart === true || raw.enabled === true) {
		return rememberedPeerConsent();
	}
	return disabledPeerConsent();
}

export function rememberedPeerConsent() {
	return Object.freeze({
		schemaVersion: PEER_CONSENT_SCHEMA_VERSION,
		mode: PeerConsentMode.REMEMBERED,
		remembered: true
	});
}

export function disabledPeerConsent() {
	return Object.freeze({
		schemaVersion: PEER_CONSENT_SCHEMA_VERSION,
		mode: PeerConsentMode.DISABLED,
		remembered: false
	});
}

export function runtimeConsentMode({ enabled = false, remembered = false } = {}) {
	if (!enabled) {
		return PeerConsentMode.DISABLED;
	}
	return remembered ? PeerConsentMode.REMEMBERED : PeerConsentMode.SESSION;
}

export function consentLabel(mode = PeerConsentMode.DISABLED) {
	return {
		[PeerConsentMode.DISABLED]: "Disabled",
		[PeerConsentMode.SESSION]: "This session only",
		[PeerConsentMode.REMEMBERED]: "Remembered on this browser"
	}[mode] || "Disabled";
}
