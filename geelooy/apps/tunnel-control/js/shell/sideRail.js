// B"H

import { h } from "../ui/core/html.js";
import { DASHBOARD_ORDER, PANE_META } from "../router/paneMeta.js";
import { activatePane, showHome } from "../router/paneRouter.js";
import { createRuntimeSwitcher } from "../runtime/runtimeSwitcher.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * B"H
 * Chapter 27: The rail became a desktop instrument panel.
 *
 * The Awtsmoos keeps the rail calm: drawn icons, subtitles, status, and a
 * compact brand card. On mobile these same buttons become the bottom app tabs.
 *
 * @param {string} key Pane key.
 * @returns {HTMLButtonElement} Button.
 */
function navButton(key) {
  const meta = PANE_META[key] || { title: key, icon: "settings", group: "core" };
  const button = h("button", {
    classes: ["awt-nav-button", `is-${meta.group || "core"}`],
    attrs: { type: "button", "data-tab": key },
    children: [
      h("span", { classes: ["awt-nav-icon"], children: [createIcon(meta.icon || key, meta.group || "core")] }),
      h("span", { classes: ["awt-nav-copy"], children: [h("strong", { text: meta.title || key }), h("small", { text: meta.desc || "Open section" })] })
    ]
  });
  button.addEventListener("click", event => {
    event.preventDefault();
    activatePane(key);
  });
  return button;
}

/**
 * B"H
 * Creates the side rail.
 *
 * @param {object} ctx Runtime context.
 * @returns {HTMLElement} Side rail.
 */
export function createSideRail(ctx) {
  const home = h("button", { classes: ["awt-home-button"], attrs: { type: "button" }, children: [createIcon("dashboard", "core"), h("strong", { text: "Dashboard" })] });
  home.addEventListener("click", event => {
    event.preventDefault();
    showHome();
  });
  return h("aside", { classes: ["awt-control-side"], children: [
    brand(ctx),
    createRuntimeSwitcher(),
    statusCard(ctx),
    home,
    h("nav", { classes: ["awt-side-tabs"], children: DASHBOARD_ORDER.map(navButton) }),
    h("div", { classes: ["awt-user-chip"], children: [h("span", { text: "A" }), h("div", { children: [h("strong", { text: "Awtsmoos" }), h("small", { text: "Administrator" })] })] })
  ] });
}

function brand(ctx) {
  return h("div", { classes: ["awt-brand-block"], children: [
    h("div", { classes: ["awt-brand-row"], children: [h("div", { classes: ["awt-brand-logo"], children: [createIcon("mesh", "core")] }), h("h1", { text: "Awtsmoos Tunnel Control" })] }),
    h("p", { text: ctx.runtime?.id || ctx.getTunnelName() || "Unbound runtime" })
  ] });
}

function statusCard(ctx) {
  return h("div", { classes: ["awt-rail-status"], children: [
    h("span", { text: "Runtime status" }),
    h("strong", { text: "● Connected" }),
    h("small", { text: ctx.runtime?.tunnel?.name || ctx.getTunnelName() || "local-agent" })
  ] });
}
