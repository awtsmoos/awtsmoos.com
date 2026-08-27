//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserNavigationPolicy
 * @description The Awtsmoos chooses one honest road for each address: native when
 * identity demands the user's real browser, embedded when local-browser execution
 * is safe, and measured fallbacks when a capability has not yet been revealed.
 */

import { classifyNativeNavigation } from "./nativeNavigationPolicy.js";

const VALID_MODES = new Set([
	"auto",
	"embedded",
	"merkava-sandbox",
	"native",
	"proxy-fallback"
]);

export function chooseBrowserNavigation(input, options = {}) {
	const preferredMode = normalizeMode(options.preferredMode);
	const nativeDecision = classifyNativeNavigation(input, {
		baseUrl: options.baseUrl,
		forceNative: preferredMode === "native"
	});
	if (nativeDecision.mode === "blocked") {
		return browserDecision("blocked", nativeDecision.reason, nativeDecision.url);
	}
	if (nativeDecision.mode === "native") {
		return browserDecision("native", nativeDecision.reason, nativeDecision.url);
	}
	if (preferredMode === "embedded") {
		return availableDecision("embedded", options, nativeDecision.url);
	}
	if (preferredMode === "proxy-fallback") {
		return availableDecision("proxy-fallback", options, nativeDecision.url);
	}
	if (preferredMode === "merkava-sandbox") {
		return availableDecision("merkava-sandbox", options, nativeDecision.url);
	}
	return automaticDecision(options, nativeDecision.url);
}

function automaticDecision(options, url) {
	if (options.embeddedAvailable === true) {
		return browserDecision("embedded", "embedded-available", url);
	}
	if (options.proxyFallbackAvailable !== false) {
		return browserDecision("proxy-fallback", "embedded-unavailable", url);
	}
	if (options.merkavaSandboxAvailable === true) {
		return browserDecision("merkava-sandbox", "proxy-unavailable", url);
	}
	return browserDecision("blocked", "no-browser-mode-available", url);
}

function availableDecision(mode, options, url) {
	const availability = {
		embedded: options.embeddedAvailable === true,
		"merkava-sandbox": options.merkavaSandboxAvailable === true,
		"proxy-fallback": options.proxyFallbackAvailable !== false
	};
	if (availability[mode]) {
		return browserDecision(mode, "user-selected-mode", url);
	}
	return automaticDecision(options, url);
}

function normalizeMode(value) {
	return VALID_MODES.has(value) ? value : "auto";
}

function browserDecision(mode, reason, url) {
	return Object.freeze({
		mode,
		reason,
		url
	});
}
