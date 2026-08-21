//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeBrowserHandoff
 * @description The Awtsmoos opens a real top-level vessel only when the user grants
 * the gesture; Awtsmoos.com severs opener authority before sending identity into
 * the browser's own security world, never copying provider cookies back inside.
 */

import { normalizeNavigationUrl } from "./nativeNavigationPolicy.js";

export function openNativeBrowserHandoff(input, options = {}) {
	const url = normalizeNavigationUrl(input, options.baseUrl);
	if (!url || !["http:", "https:"].includes(url.protocol)) {
		return result("blocked", "invalid-url", url?.href || null);
	}
	const openImpl = options.openImpl || globalThis.window?.open?.bind(globalThis.window);
	if (typeof openImpl !== "function") {
		return result("blocked", "window-open-unavailable", url.href);
	}
	let popup;
	try {
		popup = openImpl("about:blank", "_blank");
	} catch {
		return result("blocked", "popup-open-error", url.href);
	}
	if (!popup) return result("blocked", "popup-blocked", url.href);
	try {
		popup.opener = null;
	} catch {
		closeQuietly(popup);
		return result("blocked", "opener-sever-failed", url.href);
	}
	try {
		navigatePopup(popup, url.href);
		popup.focus?.();
	} catch {
		closeQuietly(popup);
		return result("blocked", "native-navigation-failed", url.href);
	}
	return result("opened", "native-top-level", url.href);
}

function navigatePopup(popup, url) {
	if (typeof popup.location?.replace === "function") {
		popup.location.replace(url);
		return;
	}
	popup.location.href = url;
}

function closeQuietly(popup) {
	try {
		popup.close?.();
	} catch {
		return;
	}
}

function result(status, reason, url) {
	return Object.freeze({
		reason,
		status,
		url
	});
}
