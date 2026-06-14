// B"H

import { h } from "../ui/core/html.js";

const INSTALL_COMMANDS = Object.freeze([
  ["Windows PowerShell", "irm https://awtsmoos.com/api/tunnel/install/windows | iex"],
  ["Mac / Linux", "curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"]
]);

/**
 * B"H
 * Chapter 411: The Script Stopped Being A Page And Became A Line Of Fire.
 *
 * The gate no longer sends the traveler into raw installer bones. It reveals the
 * exact line to paste, because the Awtsmoos wants the command held in the hand.
 */
export function createLoginGate() {
  return h("section", {
    classes: ["awt-login-gate"],
    attrs: { "aria-labelledby": "awt-login-title" },
    children: [h("div", { classes: ["awt-login-card"], children: gateChildren() })]
  });
}

function gateChildren() {
  return [
    h("div", { classes: ["awt-mini-kicker"], text: "B\"H Tunnel Control" }),
    h("h1", { attrs: { id: "awt-login-title" }, text: "Open your local codebase through Awtsmoos" }),
    h("p", { text: "Sign in, start the tiny local agent, and this panel will discover your active tunnel automatically." }),
    h("div", { classes: ["awt-login-actions"], attrs: { "aria-label": "Tunnel Control actions" }, children: [
      h("a", { attrs: { href: "/login", class: "button-link primary awt-primary-link" }, text: "Login" })
    ] }),
    h("div", { classes: ["awt-install-lines"], children: INSTALL_COMMANDS.map(commandCard) })
  ];
}

function commandCard([label, command]) {
  const pre = h("pre", { classes: ["awt-install-command"], text: command });
  const copy = h("button", { attrs: { type: "button", class: "button-link" }, text: `Copy ${label}` });
  copy.addEventListener("click", async () => {
    try { await navigator.clipboard?.writeText(command); } catch (_) {}
    copy.textContent = `Copied ${label}`;
  });
  return h("article", { classes: ["panel", "stack", "awt-install-card"], children: [
    h("h3", { text: label }),
    pre,
    copy
  ] });
}

/**
 * B"H
 * Shows only the login gate.
 */
export function showLoginGate() {
  document.body.classList.add("awt-gated");
  document.body.classList.remove("awt-preboot");
  document.body.textContent = "";
  document.body.append(createLoginGate());
}
