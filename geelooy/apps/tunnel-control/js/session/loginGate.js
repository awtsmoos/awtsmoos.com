
// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Creates the login gate.
 *
 * @returns {HTMLElement} Gate element.
 */
export function createLoginGate() {
  return h("section", {
    classes: ["awt-login-gate"],
    children: [
      h("div", {
        classes: ["awt-login-card"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H Secure entry" }),
          h("h1", { text: "Log in to open Tunnel Control" }),
          h("p", {
            text: "The control panel now starts from your browser session. After login, it discovers your active tunnel automatically."
          }),
          h("div", {
            classes: ["awt-login-actions"],
            children: [
              h("a", {
                attrs: { href: "/login", class: "button-link primary awt-primary-link" },
                text: "Login"
              }),
              h("a", {
                attrs: { href: "/api/tunnel/install/windows", class: "button-link" },
                text: "Install agent"
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
 * Shows only the login gate.
 *
 * @returns {void}
 */
export function showLoginGate() {
  document.body.classList.add("awt-gated");
  document.body.textContent = "";
  document.body.append(createLoginGate());
}
