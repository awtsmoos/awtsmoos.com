//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tutorial-family-catalog.js
 * @description The Awtsmoos gives each API mount a human teaching doorway while generated route facts remain exhaustive and source-bound.
 */

const families = [
	["/api", "API Root", "ROOT_API.md", "Root-level dynamic route demonstrations and compatibility paths."],
	["/api/admin", "Admin", "ADMIN.md", "Authenticated administration and repository-control surfaces."],
	["/api/compiler", "Compiler", "COMPILER.md", "Authenticated compiler discovery, native builds, and Android packaging."],
	["/api/contact", "Contact", "CONTACT.md", "Public contact-signal validation, mail delivery, and optional persistence."],
	["/api/email", "Email", "EMAIL.md", "Email façade joined to the Social mail route family."],
	["/api/fetch", "Fetch Proxy", "FETCH.md", "Authenticated, origin-gated, rate-limited remote fetching."],
	["/api/gpt", "GPT", "GPT.md", "Browser-relay health, capability, chat, reset, and legacy prompt access."],
	["/api/oauth", "OAuth", "OAUTH.md", "Awtsmoos OAuth authorization, clients, identity, start, and token flow."],
	["/api/ohr-hagnuz", "Ohr HaGnuz", "OHR_HAGNUZ.md", "Realtime admission ticket issuance for Ohr HaGnuz."],
	["/api/public", "Public", "PUBLIC.md", "Small public dynamic API surface beneath the shared API root."],
	["/api/runtime", "Native Runtime", "RUNTIME.md", "Authenticated generic native capability, launch, status, and stop operations."],
	["/api/sefarim", "Sefarim", "SEFARIM.md", "DosDB-backed sefer, section, and subsection reading."],
	["/api/social", "Social", "SOCIAL.md", "Identity, aliases, Heichelos, content, series, comments, governance, search, mail, drive, and more."],
	["/api/ssh", "SSH", "SSH.md", "SSH API mount whose current literal-route extractor sees no child route rows."],
	["/api/streaming", "Streaming", "STREAMING.md", "Connector/action dispatch for supported streaming providers."],
	["/api/text", "Text Jobs", "TEXT.md", "Timestamped text-job paths currently shadowed by a known derech syntax failure."],
	["/api/tunnel", "Tunnel Relay", "TUNNEL.md", "Account-authorized HTTP and filesystem relay into connected tunnels."],
	["/api/tunnel/control", "Tunnel Control", "TUNNEL_CONTROL.md", "Large authenticated control plane for agents, missions, rooms, keys, previews, and operations."],
	["/api/tunnel/install", "Tunnel Install", "TUNNEL_INSTALL.md", "Installer mount whose current literal-route extractor sees no child route rows."],
	["/api/wallet", "Wallet", "WALLET.md", "Balance, commerce catalog, entitlements, purchase, mock buy, and PayPal flows."],
	["/api/youtube", "YouTube", "YOUTUBE.md", "Google/YouTube auth, channel/video/upload, and live-stream operations."]
].map(([mount, title, file, summary]) => ({
	mount,
	title,
	manual: `docs/TUTORIALS/API/${file}`,
	summary
}));

function familyByMount(mount) {
	return families.find(family => family.mount === mount) || null;
}

module.exports = { families, familyByMount };
