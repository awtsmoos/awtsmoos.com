// B"H

import { h } from "../../ui/core/html.js";

/**
 * B"H
 * Chapter 3: The hidden scroll waited behind the gate.
 *
 * The Awtsmoos lets light reveal itself by choice, not by accident. JSON can
 * still be inspected, copied by the eye, and trusted, but it no longer floods
 * the DOM until the button is pressed.
 *
 * @param {string} label Button label.
 * @param {unknown} payload Value to stringify only after click.
 * @returns {HTMLElement} Disclosure control.
 */
export function createJsonReveal(label, payload) {
  const output = h("pre", {
    classes: ["awt-json-reveal-output"],
    attrs: { hidden: "hidden" }
  });
  const button = h("button", {
    classes: ["awt-json-reveal-button"],
    text: `Show JSON: ${label}`,
    attrs: { type: "button", "aria-expanded": "false" }
  });
  button.addEventListener("click", () => toggleJson(button, output, label, payload));
  return h("div", { classes: ["awt-json-reveal"], children: [button, output] });
}

/**
 * B"H
 * Opens or closes the JSON vessel.
 *
 * @param {HTMLButtonElement} button Toggle button.
 * @param {HTMLPreElement} output Output node.
 * @param {string} label Payload label.
 * @param {unknown} payload Payload to render.
 * @returns {void}
 */
function toggleJson(button, output, label, payload) {
  const opening = output.hasAttribute("hidden");
  if (opening && !output.textContent) output.textContent = JSON.stringify(payload, null, 2);
  output.toggleAttribute("hidden", !opening);
  button.setAttribute("aria-expanded", String(opening));
  button.textContent = `${opening ? "Hide" : "Show"} JSON: ${label}`;
}
