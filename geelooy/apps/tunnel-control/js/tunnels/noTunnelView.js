// B"H

import { h } from "../ui/core/html.js";
import { TUNNEL_MODES } from "./modes.js";

const UNIX_COMMAND = "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash";
const WINDOWS_COMMAND = "irm https://awtsmoos.com/api/tunnel/install/windows | iex";

function modeCard(mode) {
  return h("article", { classes: ["awt-login-card", "awt-mode-card"], children: [
    h("div", { classes: ["awt-mini-kicker"], text: mode.id }),
    h("h3", { text: mode.title }),
    h("p", { text: mode.description }),
    h("button", { attrs: { type: "button", "data-tunnel-mode": mode.id }, text: mode.cta })
  ] });
}

export function createNoTunnelView() {
  return h("section", {
    classes: ["awt-login-gate", "awt-no-tunnel-gate"],
    attrs: { "aria-labelledby": "awt-no-tunnel-title" },
    children: [
      h("div", { classes: ["awt-login-card", "awt-no-tunnel-card"], children: [
        h("div", { classes: ["awt-gate-brandline"], children: [
          h("span", { classes: ["awt-gate-mark"], attrs: { "aria-hidden": "true" }, text: "א" }),
          h("div", { children: [
            h("div", { classes: ["awt-mini-kicker"], text: "DEVICE DISCOVERY" }),
            h("span", { classes: ["awt-gate-status", "is-waiting"], text: "No active tunnel found yet" })
          ] })
        ] }),
        h("h1", { attrs: { id: "awt-no-tunnel-title" }, text: "Choose how your AI agents connect" }),
        h("p", { text: "The local agent gives the fullest workspace access. Code Tab and Awtsmoos OS remain zero-install options." }),
        h("div", { classes: ["awt-command-shell"], children: [h("span", { text: "$" }), h("code", { text: UNIX_COMMAND })] }),
        h("div", { classes: ["awt-login-actions"], children: [
          h("button", { attrs: { type: "button", id: "awtCopyUnixInstall", class: "primary" }, text: "Copy macOS / Linux" }),
          h("button", { attrs: { type: "button", id: "awtCopyWindowsInstall" }, text: "Copy Windows" }),
          h("button", { attrs: { type: "button", id: "awtRefreshNoTunnel" }, text: "Check again" })
        ] })
      ] }),
      h("div", { classes: ["awt-mode-grid"], children: TUNNEL_MODES.map(modeCard) })
    ]
  });
}

export function showNoTunnelView() {
  document.body.classList.add("awt-gated");
  document.body.textContent = "";
  document.body.append(createNoTunnelView());

  document.getElementById("awtRefreshNoTunnel")?.addEventListener("click", () => location.reload());
  bindCopy("awtCopyUnixInstall", UNIX_COMMAND);
  bindCopy("awtCopyWindowsInstall", WINDOWS_COMMAND);

  document.querySelectorAll("[data-tunnel-mode]").forEach(button => {
    button.addEventListener("click", () => {
      const mode = TUNNEL_MODES.find(item => item.id === button.dataset.tunnelMode);
      if (mode?.href) window.open(mode.href, "_blank", "noopener");
    });
  });
}

function bindCopy(id, command) {
  const button = document.getElementById(id);
  button?.addEventListener("click", async () => {
    const original = button.textContent;
    try {
      await navigator.clipboard.writeText(command);
      button.textContent = "Copied — run it in Terminal";
      button.dataset.state = "success";
    } catch (_) {
      button.textContent = "Copy unavailable — select the command";
      button.dataset.state = "warning";
    }
    window.setTimeout(() => {
      button.textContent = original;
      delete button.dataset.state;
    }, 2600);
  });
}
