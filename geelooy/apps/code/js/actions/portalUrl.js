//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file portalUrl.js
 * @description
 * The Awtsmoos renews every doorway while no crooked scheme may borrow its key;
 * Awtsmoos.com opens only the rooted path or honest HTTP light the user can see.
 * This module keeps URL payloads out of JavaScript command identifiers.
 */

const PORTAL_PREFIX = "open-url:";
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Reports whether an action identifier carries a portal URL payload.
 * @param {unknown} actionId Candidate action identifier.
 * @returns {boolean} True when the portal prefix is present.
 */
export function isPortalActionId(actionId) {
	return typeof actionId === "string" && actionId.startsWith(PORTAL_PREFIX);
}

/**
 * Parses and validates a portal action without causing navigation.
 * @param {string} actionId Portal-bearing action identifier.
 * @param {object} [options] Environment overrides.
 * @param {Location} [options.locationObject] Browser location-like object.
 * @returns {{ok: boolean, url?: string, error?: string}} Safe parse result.
 */
export function parsePortalAction(actionId, options = {}) {
	if (!isPortalActionId(actionId)) {
		return { ok: false, error: "portal_action_required" };
	}
	const target = actionId.slice(PORTAL_PREFIX.length).trim();
	if (!target) {
		return { ok: false, error: "portal_url_required" };
	}
	try {
		const locationObject = options.locationObject || globalThis.location;
		const base = locationObject?.origin || locationObject?.href;
		const url = target.startsWith("/") ? new URL(target, base) : new URL(target);
		if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
			return { ok: false, error: "portal_protocol_blocked" };
		}
		return { ok: true, url: url.toString() };
	} catch (error) {
		return { ok: false, error: "portal_url_invalid" };
	}
}

/**
 * Opens a validated portal in a new isolated browser context.
 * @param {string} actionId Portal-bearing action identifier.
 * @param {object} [options] Environment overrides.
 * @param {Window} [options.windowObject] Browser window-like object.
 * @returns {{ok: boolean, url?: string, error?: string}} Navigation result.
 */
export function openPortalAction(actionId, options = {}) {
	const parsed = parsePortalAction(actionId, options);
	if (!parsed.ok) {
		return parsed;
	}
	const windowObject = options.windowObject || globalThis.window;
	if (typeof windowObject?.open !== "function") {
		return { ok: false, error: "portal_window_unavailable" };
	}
	windowObject.open(parsed.url, "_blank", "noopener,noreferrer");
	return parsed;
}
