
// B"H

import { h } from "../ui/core/html.js";

/**
 * B"H
 * Builds the sidebar status chips.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Status stack.
 */
export function createStatusRail(ctx) {
  const tunnel = h("strong", { text: ctx.getTunnelName() || "No tunnel" });
  const root = h("strong", { text: ctx.getProjectPath() || "." });
  const user = h("strong", { text: ctx.session?.userId || "Logged in" });

  const stack = h("div", {
    classes: ["awt-status-stack"],
    children: [
      chip("User", user),
      chip("Tunnel", tunnel),
      chip("Root", root)
    ]
  });

  const refresh = () => {
    tunnel.textContent = ctx.getTunnelName() || "No tunnel";
    root.textContent = ctx.getProjectPath() || ".";
    user.textContent = ctx.session?.userId || "Logged in";
  };

  document.addEventListener("input", refresh, true);
  document.addEventListener("change", refresh, true);
  setInterval(refresh, 2500);

  return stack;
}

/**
 * B"H
 * Creates one status chip.
 *
 * @param {string} label Label.
 * @param {HTMLElement} value Value node.
 * @returns {HTMLElement} Chip.
 */
function chip(label, value) {
  return h("div", {
    classes: ["awt-status-chip"],
    children: [document.createTextNode(label), value]
  });
}
