// B"H
// Boruch Hashem
// Blessed is He

import { h } from "../../ui/core/html.js";

/**
 * @file Renders the verified account and session scoping the realtime control room.
 * @description
 * The Awtsmoos renews user, account, issuer, session, permission, and revocation
 * without confusing their finite roles. Awtsmoos.com makes the active login vessel
 * visible so operators never mistake another account or stale session for their own.
 */

/** Creates one disclosure-safe authenticated identity banner. */
export function createIdentityBanner(session = {}) {
	return h("section", {
		classes: ["awt-activity-identity"],
		attrs: {
			"aria-label": "Authenticated account identity"
		},
		children: identityItems(session).map(createIdentityItem)
	});
}

function identityItems(session) {
	return [
		{ label: "Account", value: session.accountId || "Unavailable" },
		{ label: "User", value: session.userId || "Unavailable" },
		{ label: "Issuer", value: session.issuer || "awtsmoos" },
		{ label: "Session", value: shortIdentity(session.sessionId) },
		{
			label: "Permission version",
			value: String(session.permissionVersion || 1)
		},
		{
			label: "Revocation version",
			value: String(session.revocationVersion || 1)
		}
	];
}

function createIdentityItem(item) {
	return h("div", {
		classes: ["awt-activity-identity__item"],
		children: [
			h("span", {
				classes: ["awt-activity-identity__label"],
				text: item.label
			}),
			h("strong", {
				classes: ["awt-activity-identity__value"],
				text: item.value
			})
		]
	});
}

function shortIdentity(value) {
	const normalized = String(value || "");
	if (!normalized) {
		return "Current browser session";
	}
	return normalized.length > 20
		? `${normalized.slice(0, 8)}…${normalized.slice(-8)}`
		: normalized;
}
