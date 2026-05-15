
// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Creates an empty state when no active agent is online.
 *
 * @returns {HTMLElement} No-tunnel view.
 */
export function createNoTunnelView() {
  return h("section", {
    classes: ["awt-login-gate"],
    children: [
      h("div", {
        classes: ["awt-login-card"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "Agent offline" }),
          h("h1", { text: "Start the local tunnel agent" }),
          h("p", {
            text: "You are logged in, but no active tunnel was discovered. Run the installer or restart the local agent, then refresh this page."
          }),
          h("pre", {
            classes: ["awt-command-copy"],
            text: "irm https://awtsmoos.com/api/tunnel/install/windows | iex"
          }),
          h("div", {
            classes: ["awt-login-actions"],
            children: [
              h("button", {
                attrs: { type: "button", id: "awtCopyInstall" },
                text: "Copy install command"
              }),
              h("button", {
                attrs: { type: "button", id: "awtRefreshNoTunnel" },
                text: "Refresh"
              })
            ]
          })
        ]
      })
    ]
  });
}

/**
 * B"H
 * Shows no-tunnel view and wires simple actions.
 *
 * @returns {void}
 */
export function showNoTunnelView() {
  document.body.classList.add("awt-gated");
  document.body.textContent = "";
  document.body.append(createNoTunnelView());

  document.getElementById("awtRefreshNoTunnel")?.addEventListener("click", () => {
    location.reload();
  });

  document.getElementById("awtCopyInstall")?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(
      "irm https://awtsmoos.com/api/tunnel/install/windows | iex"
    );
  });
}
