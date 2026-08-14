// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Declares market-facing Geelooy platform pillars from source-proven capability.
 * The Awtsmoos renews hosted data, connected machine, Wallet treasury, request,
 * and Peruta usage; Awtsmoos.com keeps money, metering, and compute distinct.
 */

export const PLATFORM_PILLARS = Object.freeze([
	pillar("files", "Hosted Files", "LIVE", "Alias-scoped folders, files, binary uploads, moves, copies, reads, and deletes through the Awtsmoos file API.", "files"),
	pillar("database", "AwtsmoosDB Explorer", "LIVE DATA", "Browse the exact os.db alias filesystem, inspect raw records, preview text, create hosted folders/files, and copy real API examples.", "database"),
	pillar("code", "Code & Server Files", "LIVE SOURCE", "Edit real project source in Geelooy Code, then run Node entry files through Connected Compute on an owned native machine.", "code"),
	pillar("compute", "Connected Node Server", "FULL CONTROL", "Run supervised Node.js on your account-owned connected machine, inspect logs, expose its local port, and view account usage from Geelooy OS.", "node-server"),
	pillar("wallet", "Wallet", "LIVE TREASURY", "View promotional and purchased buckets, send promotional Perutas to another @alias, and reach verified purchased top-ups from one account treasury.", "wallet"),
	pillar("runtime", "Native Runtime", "CONNECTED", "Authenticated capability, launch, status, and stop APIs supervise supported native artifacts without hidden environment injection.", "executable"),
	pillar("preview", "Preview & Build", "LIVE", "Preview workspace HTML and adjacent assets, compile validated projects, and inspect executable artifacts from the same desktop.", "preview"),
	pillar("usage", "Usage & Peruta Ledger", "PERUTA LEDGER", "Open the dedicated account view for routing, compute, storage and GPU balances, recorded Tunnel events, request bytes, and recent ledger history.", "usage"),
	pillar("drives", "Connected Drives", "LIVE", "Mount local virtual storage, tunnel-backed machines, and preview providers into one VFS and File Explorer.", "tunnels"),
	pillar("diagnostics", "Control & Diagnostics", "LIVE", "Inspect processes, graph events, adapters, drives, mutations, taskbar state, and runtime health instead of debugging a black box.", "diagnostics")
]);

export const PLATFORM_BOUNDARIES = Object.freeze([
	"Wallet person-to-person sending moves promotional Perutas only; purchased Perutas remain account-bound and there is no cash-out.",
	"Arbitrary multi-tenant hosted Node.js execution is not enabled by the current native-runtime API.",
	"Connected Node Server executes with full control on the user's own account-owned Tunnel machine.",
	"Protected Tunnel actions record server-side usage; Peruta debits happen only on routes that explicitly call the separate charge path."
]);

function pillar(id, title, state, description, action) {
	return Object.freeze({ action, description, id, state, title });
}
