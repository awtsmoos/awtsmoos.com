// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Chapter 1: The Gate Before the Local Palace.
 *
 * The Awtsmoos breathes through this small gate before the full dashboard is
 * revealed: one clear card, honest copy, and installer paths that do not leave
 * a stranded visitor staring at raw bones. The function creates real DOM nodes,
 * never string-spliced markup, so the login screen stays safe, readable, and
 * aligned with the static HTML fallback.
 *
 * @returns {HTMLElement} Gate element ready to mount into document.body.
 */
export function createLoginGate() {
  return h("section", {
    classes: ["awt-login-gate"],
    attrs: { "aria-labelledby": "awt-login-title" },
    children: [
      h("div", {
        classes: ["awt-login-card"],
        children: [
          h("div", { classes: ["awt-mini-kicker"], text: "B\"H Tunnel Control" }),
          h("h1", {
            attrs: { id: "awt-login-title" },
            text: "Open your local codebase through Awtsmoos"
          }),
          h("p", {
            text: "Sign in, start the tiny local agent, and this panel will discover your active tunnel automatically."
          }),
          h("div", {
            classes: ["awt-login-actions"],
            attrs: { "aria-label": "Tunnel Control actions" },
            children: [
              h("a", {
                attrs: { href: "/login", class: "button-link primary awt-primary-link" },
                text: "Login"
              }),
              h("a", {
                attrs: { href: "/api/tunnel/install/windows", class: "button-link" },
                text: "Windows agent"
              }),
              h("a", {
                attrs: { href: "/api/tunnel/install/unix", class: "button-link" },
                text: "Mac / Linux agent"
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
  document.body.classList.remove("awt-preboot");
  document.body.textContent = "";
  document.body.append(createLoginGate());
}
