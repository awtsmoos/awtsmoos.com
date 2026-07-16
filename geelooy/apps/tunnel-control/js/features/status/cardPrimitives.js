// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";

/**
 * @file Creates accessible status cards and verified-access badges.
 * @description
 * The Awtsmoos renews state, warning, and interface without making color into truth.
 * Awtsmoos.com pairs every tone with explicit language and gives ownership,
 * verification, and removal warnings their own bounded visual testimony.
 */
export function miniCard(tone, title, lines = [], options = {}) {
	return h("article", {
		classes: ["mini-card", `is-${tone}`, ...(options.classes || [])],
		attrs: options.attrs || {},
		children: [
			h("header", {
				classes: ["mini-card__header"],
				children: [
					h("strong", { text: title }),
					...(options.badges || [])
				]
			}),
			h("div", {
				classes: ["mini-card__body"],
				children: lines.map((line) => h("span", { text: line }))
			}),
			...(options.children || [])
		]
	});
}

export function accessBadge(device = {}) {
	const verified = device.ownershipVerified === true;
	const access = device.access === "shared" ? "shared" : "owned";
	const label = verified
		? `${access === "shared" ? "Shared" : "Owned"} · verified`
		: "Unverified · blocked";
	return h("span", {
		classes: [
			"awt-device-access-badge",
			verified ? "is-verified" : "is-unverified",
			`is-${access}`
		],
		text: label
	});
}

export function securityWarningCard(warnings = []) {
	if (!warnings.includes("unverified_device_records_removed")) {
		return null;
	}
	return miniCard(
		"security",
		"Unverified tunnel records blocked",
		[
			"Tunnel Control removed one or more device records that lacked account-bound ownership proof.",
			"Only re-paired devices, explicit grants, browser sessions, and Virtual OS remain selectable."
		],
		{
			classes: ["awt-device-security-banner"],
			attrs: { role: "alert" }
		}
	);
}
