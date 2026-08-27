// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Truthful Tunnel Control mode cards for native and browser-hosted vessels.
 * @description
 * The Awtsmoos has many doors but each door carries different authority. Awtsmoos.com
 * tells the human that Apps Code and Geelooy OS may independently host optional browser
 * peers, while neither browser vessel replaces the native tunnel needed for real machine
 * shell, roots, and browser-control authority.
 */

import { h } from "../../ui/core/html.js";

export const CANONICAL_OS_URL = "https://awtsmoos.com/os";
export const CODE_EDITOR_URL = "/apps/code";
export const NATIVE_TUNNEL_URL = "/apps/tunnel";
export const TUNNEL_CONTROL_URL = "/apps/tunnel-control";
export const CUSTOM_GPT_URL = "https://chatgpt.com/g/g-6a03feea8398819192067ae3dbfa449c-awtsmoos-shliach-agent";

export const MODE_LINKS = Object.freeze([
	{ href: NATIVE_TUNNEL_URL, label: "Native tunnel" },
	{ href: CODE_EDITOR_URL, label: "Code editor" },
	{ href: CANONICAL_OS_URL, label: "Awtsmoos OS" },
	{ href: CUSTOM_GPT_URL, label: "Custom GPT Shliach" }
]);

export const TUNNEL_MODES = Object.freeze([
	{
		key: "native",
		title: "Native installed tunnel",
		summary: "Real machine authority: local files, shell commands, Chrome, project roots, and installer refresh.",
		link: NATIVE_TUNNEL_URL,
		cta: "Install / restart"
	},
	{
		key: "browser",
		title: "Optional browser-hosted peers",
		summary: "Apps Code and Geelooy OS can be enabled independently as account-bound browser-hosted peers. Session-only and remembered consent are explicit; browser authority never replaces native shell authority.",
		link: CODE_EDITOR_URL,
		cta: "Open Code"
	},
	{
		key: "virtual",
		title: "One Awtsmoos Virtual OS",
		summary: "Canonical hosted OS at awtsmoos.com/os. Its optional browser-tab peer remains a Virtual OS vessel with bounded virtual files/actions and no native shell.",
		link: CANONICAL_OS_URL,
		cta: "Open OS"
	}
]);

export function modeStatus(mode, got = {}) {
	if (mode.key === "native") {
		return (got.nativeDevices || got.tunnels || []).length ? "available" : "installable";
	}
	if (mode.key === "browser") {
		return (got.browserDevices || []).length ? "connected" : "optional · enable Code or OS";
	}
	if (mode.key === "virtual") {
		return got.virtualDevice === null ? "login needed" : "canonical OS";
	}
	return "ready";
}

export function createModeCards(got = {}) {
	return h("div", {
		classes: ["awt-mode-card-grid"],
		children: TUNNEL_MODES.map(mode => modeCard(mode, modeStatus(mode, got)))
	});
}

export function createModeLinks() {
	return h("div", {
		classes: ["awt-link-grid", "awt-mode-links"],
		children: MODE_LINKS.map(link => h("a", {
			attrs: { href: link.href, target: "_blank", rel: "noopener" },
			text: link.label
		}))
	});
}

function modeCard(mode, status) {
	return h("article", {
		classes: ["awt-landing-card", "awt-mode-card", `is-${mode.key}`],
		children: [
			h("span", { classes: ["awt-card-kicker"], text: status }),
			h("strong", { text: mode.title }),
			h("p", { text: mode.summary }),
			h("a", {
				attrs: { href: mode.link, target: "_blank", rel: "noopener" },
				text: mode.cta || "Open"
			})
		]
	});
}
