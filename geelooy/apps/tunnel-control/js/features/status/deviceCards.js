// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../lib/dom.js";
import { safe, setPill, setText } from "./statusText.js";
import {
	accessBadge,
	miniCard
} from "./cardPrimitives.js";

/**
 * @file Renders identity and device cards without machine-inventory disclosure.
 * @description
 * The Awtsmoos renews identity, device, and status through finite words.
 * Awtsmoos.com shows access, verification, connection, platform, and version while
 * roots, tool maps, write envelopes, limits, profiles, and secrets remain absent.
 */
export function renderIdentityNice(response) {
	if (!response || response.ok === false) {
		setPill("authPill", "authText", "bad", "Not logged in");
		setText("miniLogin", "Not logged in");
		$("userChip")?.classList.add("hidden");
		return miniCard("warning", "Not logged in", [
			"Login is required for account-bound tunnel discovery."
		]);
	}
	const identity = response.identity || response.user || response;
	const userId = safe(identity.userId || response.userId, "unknown user");
	const accountId = safe(identity.accountId, userId);
	setPill("authPill", "authText", "good", "Logged in");
	setText("miniLogin", userId);
	setText("userName", userId);
	$("userChip")?.classList.remove("hidden");
	return miniCard("success", `Logged in as ${userId}`, [
		`Account: ${accountId}`,
		`Identity source: ${safe(identity.kind || response.kind, "session")}`
	]);
}

export function offlineDeviceCard() {
	return miniCard("warning", "No verified native or browser tunnel", [
		"Unproven records are blocked instead of being shown.",
		"Pair this device again, open a verified browser tunnel, or use Virtual OS."
	]);
}

export function connectedDeviceCard(device = {}) {
	return miniCard(
		"success",
		`Recommended: ${safe(device.tunnelName, "Verified vessel")}`,
		[
			`Vessel: ${safe(device.vesselType || device.kind, "vessel")}`,
			`State: ${device.connected === false ? "offline" : "connected"}`,
			`Platform: ${safe(device.platform, "not disclosed")}`,
			`Version: ${safe(device.agentVersion, "not reported")}`
		],
		{ badges: [accessBadge(device)] }
	);
}

export function deviceListCard(title, devices = [], emptyLine = "None connected") {
	if (!devices.length) {
		return miniCard("warning", title, [emptyLine]);
	}
	return miniCard(
		"success",
		title,
		devices.slice(0, 8).map((device) => {
			const access = device.access === "shared" ? "shared" : "owned";
			const state = device.connected === false ? "offline" : "connected";
			return `${device.tunnelName} · ${access} · verified · ${state}`;
		})
	);
}
