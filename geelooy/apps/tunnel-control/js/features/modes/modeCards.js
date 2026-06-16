// B"H

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
    summary: "Local machine power: real files, shell commands, Chrome, project roots, and installer refresh.",
    link: NATIVE_TUNNEL_URL,
    cta: "Install / restart"
  },
  {
    key: "browser",
    title: "Browser-tab code vessel",
    summary: "The code editor tab becomes a live vessel with workspace storage, sockets, and recoverable reconnects.",
    link: CODE_EDITOR_URL,
    cta: "Open code"
  },
  {
    key: "virtual",
    title: "One Awtsmoos Virtual OS",
    summary: "Canonical hosted OS at awtsmoos.com/os. Other app routes should point into this same OS identity.",
    link: CANONICAL_OS_URL,
    cta: "Open OS"
  }
]);

/**
 * B"H
 * Chapter: Three Doors, One Palace.
 *
 * There are many entrances, but only one hosted OS identity. The code editor,
 * geelooy routes, and tunnel-control must bow to the canonical OS doorway:
 * awtsmoos.com/os.
 */
export function modeStatus(mode, got = {}) {
  if (mode.key === "native") return (got.nativeDevices || got.tunnels || []).length ? "available" : "installable";
  if (mode.key === "browser") return (got.browserDevices || []).length ? "connected" : "open /apps/code";
  if (mode.key === "virtual") return got.virtualDevice === null ? "login needed" : "canonical OS";
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
    children: MODE_LINKS.map(link => h("a", { attrs: { href: link.href, target: "_blank", rel: "noopener" }, text: link.label }))
  });
}

function modeCard(mode, status) {
  return h("article", {
    classes: ["awt-landing-card", "awt-mode-card", `is-${mode.key}`],
    children: [
      h("span", { classes: ["awt-card-kicker"], text: status }),
      h("strong", { text: mode.title }),
      h("p", { text: mode.summary }),
      h("a", { attrs: { href: mode.link, target: "_blank", rel: "noopener" }, text: mode.cta || "Open" })
    ]
  });
}
