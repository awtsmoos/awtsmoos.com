//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestDocument
 * @description The Awtsmoos reveals a page inside an originless glass chamber;
 * Awtsmoos.com lets the local browser shape DOM and CSS while a nonce seals script
 * authority, and every ambient network road remains closed outside the measured flow.
 */

import { hostMessage, HostToGuestType } from "./embeddedGuestProtocol.js";
import { embeddedGuestBootstrap } from "./embeddedGuestBootstrap.js";

export function buildEmbeddedGuestDocument(options = {}) {
	const channelId = validatedChannel(options.channelId);
	const scriptNonce = validatedNonce(options.scriptNonce);
	const title = escapeMarkup(options.title || "Awtsmoos Browser");
	const csp = embeddedGuestCsp(scriptNonce);
	const bootstrap = embeddedGuestBootstrap(channelId, scriptNonce);
	return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${escapeMarkup(csp)}">
<title>${title}</title>
<style>html,body{margin:0;min-height:100%;background:#fff;color:#111}#awtsmoos-guest-root{min-height:100vh}</style>
</head>
<body>
<div id="awtsmoos-guest-root"></div>
<script nonce="${escapeMarkup(scriptNonce)}">${bootstrap}</script>
</body>
</html>`;
}

export function embeddedGuestCsp(scriptNonce) {
	const nonce = validatedNonce(scriptNonce);
	return [
		"default-src 'none'",
		"base-uri 'none'",
		"connect-src 'none'",
		"form-action 'none'",
		"frame-src 'none'",
		"img-src data: blob:",
		"media-src data: blob:",
		"object-src 'none'",
		`script-src 'nonce-${nonce}'`,
		"style-src 'unsafe-inline'",
		"worker-src 'none'"
	].join("; ");
}

function validatedChannel(channelId) {
	return hostMessage(channelId, HostToGuestType.RESET).channelId;
}

function validatedNonce(value) {
	const nonce = typeof value === "string" ? value.trim() : "";
	if (!nonce || nonce.length > 128 || !/^[A-Za-z0-9_-]+$/.test(nonce)) {
		throw new TypeError("BROWSER_GUEST_NONCE_INVALID");
	}
	return nonce;
}

function escapeMarkup(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}
