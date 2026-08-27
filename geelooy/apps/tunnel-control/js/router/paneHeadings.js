// B"H

import { h } from "../ui/core/html.js";
import { PANE_META } from "./paneMeta.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * B"H
 * Chapter 28: Pane headings joined the icon covenant.
 *
 * A subpage now begins with the same drawn sign language as the dashboard and
 * rail, preserving emoji only as legacy metadata rather than visible clutter.
 *
 * @returns {void}
 */
export function normalizePaneHeadings() {
  for (const pane of document.querySelectorAll("[data-pane]")) {
    if (pane.querySelector(":scope > .awt-pane-heading")) continue;
    const key = pane.dataset.pane || "";
    const meta = PANE_META[key] || fallbackMeta(key);
    pane.prepend(h("div", { classes: ["awt-pane-heading"], children: [
      h("div", { classes: ["awt-pane-heading-top"], children: [
        h("div", { classes: ["awt-pane-title-mark"], children: [
          h("span", { classes: ["awt-pane-icon", `is-${meta.group || "core"}`], children: [createIcon(meta.icon || key, meta.group || "core")] }),
          h("span", { classes: ["awt-pane-kicker"], text: meta.group || "workspace" })
        ] }),
        h("div", { classes: ["awt-pane-badges"], children: (meta.badges || ["ready"]).map(badge) })
      ] }),
      h("h2", { text: meta.title || key }),
      h("p", { text: meta.desc || "Focused controls." })
    ] }));
  }
}

function fallbackMeta(key) {
  return { title: key || "Panel", desc: "Focused controls.", icon: "settings", group: "core", badges: ["ready"] };
}

function badge(value) {
  return h("span", { classes: ["awt-card-chip", `is-${value}`], text: value });
}
