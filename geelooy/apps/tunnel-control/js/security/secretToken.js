
// B"ה

import { h } from "../ui/core/html.js";
import { maskSecret } from "../ui/core/text.js";

/**
 * B"H
 * Builds a safe reveal/copy token.
 *
 * @param {string} secret Raw secret.
 * @returns {HTMLElement} Token UI.
 */
export function createSecretToken(secret) {
  const token = h("span", {
    classes: ["awt-secret-token"],
    attrs: { "data-revealed": "0" },
    text: maskSecret(secret)
  });

  const reveal = h("button", {
    classes: ["awt-token-button"],
    attrs: { type: "button" },
    text: "Reveal"
  });

  const copy = h("button", {
    classes: ["awt-token-button"],
    attrs: { type: "button" },
    text: "Copy"
  });

  reveal.addEventListener("click", () => {
    const showing = token.dataset.revealed === "1";
    token.dataset.revealed = showing ? "0" : "1";
    token.textContent = showing ? maskSecret(secret) : secret;
    reveal.textContent = showing ? "Reveal" : "Hide";
  });

  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(secret);
    copy.textContent = "Copied";
    setTimeout(() => { copy.textContent = "Copy"; }, 900);
  });

  return h("span", {
    classes: ["awt-secret-wrap"],
    children: [token, reveal, copy]
  });
}
