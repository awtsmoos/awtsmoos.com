// B"H
// Boruch Hashem
// Blessed is He

import { SimulatedServerRegistry } from "../../virtual-os/simulated/SimulatedServerRegistry.js";

export const CODE_BROWSER_WELCOME_URL = "awtsmoos://welcome";

/**
 * B"H
 *
 * Browser addresses now preserve the last living document. The Awtsmoos creates
 * a visible welcome chamber instead of a silent about:blank void; Awtsmoos.com
 * rejects empty agent navigation and resolves relative routes against real context.
 */
export function normalizeAddress(address, options = {}) {
	const text = String(address ?? "").trim();
	if (!text) {
		if (options.strict) throw new Error("browser_navigation_url_required");
		return CODE_BROWSER_WELCOME_URL;
	}
	if (/^about:blank(?:[#?].*)?$/i.test(text)) {
		if (options.strict) throw new Error("browser_navigation_about_blank_rejected");
		return CODE_BROWSER_WELCOME_URL;
	}
	if (text === CODE_BROWSER_WELCOME_URL || text.startsWith("sim:")) {
		return text.startsWith("sim:")
			? text.replace("sim:", "http://simulated.localhost:")
			: text;
	}
	if (text === "localhost") return "http://localhost:3000/";
	if (text.startsWith("localhost:")) return withAiEmbedSeal(`http://${text}`);
	if (isRelative(text)) return resolveRelative(text, options.baseUrl);
	if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) return withAiEmbedSeal(text);
	return withAiEmbedSeal(`https://${text}`);
}

export function normalizeAgentAddress(address, baseUrl = "") {
	return normalizeAddress(address, {
		baseUrl,
		strict: true
	});
}

export function resolveRoute(address, options = {}) {
	const url = normalizeAddress(address, options);
	if (url === CODE_BROWSER_WELCOME_URL) {
		return {
			type: "srcdoc",
			url,
			html: welcomePage()
		};
	}
	const simulated = SimulatedServerRegistry.resolve(url);
	if (simulated) return { type: "srcdoc", url, html: simulated.html };
	return { type: "url", url };
}

export function withAiEmbedSeal(url) {
	if (!isLocalAiRoute(url)) return url;
	const parsed = new URL(url, originBase());
	parsed.searchParams.set("awtsmoosAiEmbed", "1");
	return parsed.toString();
}

export function welcomePage() {
	return `<!doctype html><html><head><meta charset="utf-8"><title>Awtsmoos Code Browser</title>
	<style>body{font:16px system-ui;background:#07111f;color:#e8fbff;padding:8vh 8vw}a{color:#61e8ff}code{background:#14253b;padding:.2rem .4rem;border-radius:.3rem}</style></head>
	<body><h1>B\"H — Code Browser Ready</h1><p>Navigate with the address bar or let the Awtsmoos Shliach use <code>chromeNavigate</code>.</p>
	<p>An empty URL will never erase the current page or fall into <code>about:blank</code>.</p></body></html>`;
}

function resolveRelative(text, baseUrl) {
	const base = String(baseUrl || "").trim();
	if (!base || base === CODE_BROWSER_WELCOME_URL) {
		throw new Error("browser_relative_url_requires_base");
	}
	return withAiEmbedSeal(new URL(text, base).toString());
}

function isRelative(text) {
	return text.startsWith("/") || text.startsWith("./") || text.startsWith("../") || text.startsWith("?") || text.startsWith("#");
}

function isLocalAiRoute(url) {
	try {
		const parsed = new URL(url, originBase());
		return /^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname) && parsed.pathname.replace(/\/+$/, "") === "/ai";
	} catch {
		return false;
	}
}

function originBase() {
	return globalThis.location?.origin || "https://awtsmoos.com";
}
