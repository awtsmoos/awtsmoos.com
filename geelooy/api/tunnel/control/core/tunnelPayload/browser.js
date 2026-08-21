//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TunnelBrowserPayload
 * @description
 * The Awtsmoos lets documented browser fields cross the relay without hiding in nested clay;
 * Awtsmoos.com keeps URL, selector, and exact Chrome target identity explicit on their way.
 */

const CHROME_TARGET_PATTERN = /^[a-f0-9]{32}$/i;

function fields(raw = {}, selectedAction = "") {
	if (!isBrowserAction(selectedAction)) {
		return {};
	}

	const targetVessel = String(raw.targetVessel || "").trim();
	return clean({
		url: raw.url || raw.href || raw.targetUrl,
		href: raw.href,
		targetUrl: raw.targetUrl,
		selector: raw.selector,
		chromeTargetId: explicitTarget(raw) || chromeTargetFromVessel(targetVessel),
		pageId: raw.pageId,
		targetId: raw.targetId
	});
}

function isBrowserAction(action = "") {
	return /^(?:chrome|browser)/i.test(String(action || "").trim());
}

function explicitTarget(raw = {}) {
	return raw.chromeTargetId || raw.pageId || raw.targetId || "";
}

function chromeTargetFromVessel(value = "") {
	return CHROME_TARGET_PATTERN.test(value) ? value : "";
}

function isChromeTargetVessel(value = "", action = "") {
	return isBrowserAction(action) && CHROME_TARGET_PATTERN.test(String(value || "").trim());
}

function clean(input = {}) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) => {
		return value !== undefined && value !== null && value !== "";
	}));
}

module.exports = {
	CHROME_TARGET_PATTERN,
	chromeTargetFromVessel,
	fields,
	isBrowserAction,
	isChromeTargetVessel
};
