// B"H
// Boruch Hashem
// Blessed is He

import { PROJECT_CAPABILITIES } from "../../../shared/workspace/projectCapabilities.js";

/**
 * B"H
 * Declares OS project pillars from the same capability testimony consumed by Drive.
 * The Awtsmoos renews publication, data, compute, identity, Git, domain, and observation as one source;
 * Awtsmoos.com keeps OS-specific treasury and diagnostic vessels beside that shared truth without duplicating it.
 */

const ACTIONS = Object.freeze({
	files: "files",
	code: "code",
	preview: "preview",
	publish: "sites",
	database: "database",
	"native-compute": "node-server",
	"trusted-node": "node-server",
	"tenant-node": "diagnostics",
	bindings: "tunnels",
	auth: "diagnostics",
	social: "diagnostics",
	git: "code",
	domains: "sites",
	observe: "diagnostics"
});

export const PLATFORM_PILLARS = Object.freeze([
	...PROJECT_CAPABILITIES.map(toPillar),
	pillar("wallet", "Wallet", "LIVE TREASURY", "View promotional and purchased buckets, send promotional Perutas to another @alias, and reach verified purchased top-ups from one account treasury.", "wallet"),
	pillar("usage", "Usage & Peruta Ledger", "PERUTA LEDGER", "Open the account view for routing, compute, storage, GPU balances, Tunnel events, request bytes, and recent ledger history.", "usage"),
	pillar("drives", "Connected Drives", "LIVE", "Mount local virtual storage, tunnel-backed machines, and preview providers into one VFS and File Explorer.", "tunnels")
]);

export const PLATFORM_BOUNDARIES = Object.freeze([
	"Static Drive Sites and authenticated project data are live; provider attachments remain explicit until bound by real backend capability.",
	"Public multi-tenant Node is blocked until a genuine OS/container/VM isolation provider exists.",
	"Connected Node Server executes trusted project code with full Node authority on the user's own account-owned Tunnel machine.",
	"Project source may declare secret binding names, but secret values remain outside portable files.",
	"Wallet person-to-person sending moves promotional Perutas only; purchased Perutas remain account-bound and there is no cash-out.",
	"Protected Tunnel actions record server-side usage; Peruta debits happen only on routes that explicitly call the separate charge path."
]);

function toPillar(capability) {
	return pillar(
		capability.id,
		capability.title,
		capability.readiness.toUpperCase(),
		capability.description,
		ACTIONS[capability.id] || "diagnostics"
	);
}

function pillar(id, title, state, description, action) {
	return Object.freeze({ action, description, id, state, title });
}
