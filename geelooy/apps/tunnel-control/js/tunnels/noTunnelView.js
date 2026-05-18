// B\"H

import { h } from "../ui/core/html.js";
import { TUNNEL_MODES } from "./modes.js";

function modeCard(mode) {
  const children = [
    h("div", { classes: ["awt-mini-kicker"], text: mode.id }),
    h("h3", { text: mode.title }),
    h("p", { text: mode.description }),
    h("button", { attrs: { type: "button", "data-tunnel-mode": mode.id }, text: mode.cta })
  ];
  return h("article", { classes: ["awt-login-card", "awt-mode-card"], children });
}

export function createNoTunnelView() {
  return h("section", {
    classes: ["awt-login-gate"],
    children: [
      h("div", {
        classes: ["awt-login-card"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "Connect mode" }),
          h("h1", { text: "Choose how AI_should connect" }),
          h("p", { text: "Local agent is the full power path. Code Tab and Awtsmoos OS are zero-install options." }),
          h("pre", { classes: ["awt-command-copy"], text: "irm https://awtsmoos.com/api/tunnel/install/windows | iex" }),
          h("div", { classes: ["awt-login-actions"], children: [
            h("button", { attrs: { type: "button", id: "awtCopyInstall" }, text: "Copy install command" }),
            h("button", { attrs: { type: "button", id: "awtRefreshNoTunnel" }, text: "Refresh" })
          ] })
        ]
      }),
      h("div", { classes: ["awt-mode-grid"], children: TUNNEL_MODES.map(modeCard) })
    ]
  });
}

export function showNoTunnelView() {
  document.body.classList.add("awt-gated");
  document.body.textContent = "";
  document.body.append(createNoTunnelView());

  document.getElementById("awtRefreshNoTunnel")?.addEventListener("click", () => location.reload());
  document.getElementById("awtCopyInstall")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText("irm https://awtsmoos.com/api/tunnel/install/windows | iex");
  });

  document.querySelectorAll("[data-tunnel-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const mode = TUNNEL_MODES.find(x => x.id === button.dataset.tunnelMode);
      if (mode?.href) window.open(mode.href, "_blank", "noopener");
    });
  });
}
