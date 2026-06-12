// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";
import { PAGE_GROUPS } from "../shell/pageSpecs.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * B"H
 * Chapter 26: The dashboard tile received a drawn flame.
 *
 * The Awtsmoos lets every tile keep its human label, while the icon becomes a
 * CSS-tinted SVG vessel matching the lucid blue/green/purple picture language.
 *
 * @param {string} key Pane key.
 * @param {object} meta Pane metadata.
 * @returns {HTMLButtonElement} Card button.
 */
export function createDashboardCard(key, meta = {}) {
  const group = meta.group || "core";
  const card = h("button", {
    classes: ["awt-action-card", `is-${group}`],
    attrs: { type: "button", "data-awt-navigate": key, "data-awt-group": group },
    children: [
      h("div", { classes: ["awt-action-icon", `is-${group}`], children: [createIcon(meta.icon || key, group)] }),
      h("div", { classes: ["awt-action-copy"], children: [
        h("strong", { text: meta.title || key }),
        h("span", { text: meta.desc || "Open this workspace." }),
        h("div", { classes: ["awt-card-meta"], children: metaChips(meta) })
      ] })
    ]
  });
  card.addEventListener("click", event => {
    event.preventDefault();
    activatePane(key);
  });
  return card;
}

/**
 * B"H
 * Builds small card chips.
 *
 * @param {object} meta Pane metadata.
 * @returns {HTMLElement[]} Chips.
 */
function metaChips(meta) {
  const chips = [chip(PAGE_GROUPS[meta.group] || meta.group || "Core", "group")];
  for (const badge of meta.badges || []) chips.push(chip(badge, badge));
  return chips;
}

/**
 * B"H
 * Makes one chip.
 *
 * @param {string} label Chip text.
 * @param {string} kind Chip kind.
 * @returns {HTMLElement} Chip.
 */
function chip(label, kind) {
  return h("span", { classes: ["awt-card-chip", `is-${kind}`], text: label });
}
