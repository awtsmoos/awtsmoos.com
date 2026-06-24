// B"H

import { h } from "../ui/core/html.js";
import { activatePane } from "../router/paneRouter.js";
import { PAGE_GROUPS } from "../shell/pageSpecs.js";
import { createIcon } from "../ui/iconRegistry.js";

/**
 * B"H
 * Chapter 906: Every card confessed its rank.
 *
 * A command center must know what is core and what is advanced. The tile still
 * opens the same pane, but it now carries enough truth for layout, emphasis,
 * keyboard search, and the mission-room crown.
 */
export function createDashboardCard(key, meta = {}) {
  const group = meta.group || "core";
  const isCore = (meta.badges || []).includes("core");
  const card = h("button", {
    classes: ["awt-action-card", `is-${group}`, isCore ? "is-core" : "is-advanced", key === "missionRooms" ? "is-primary-mission" : ""],
    attrs: { type: "button", "data-awt-navigate": key, "data-awt-key": key, "data-awt-group": group, "data-awt-core": String(isCore) },
    children: [icon(meta, key, group), copy(key, meta, group)]
  });
  card.addEventListener("click", event => { event.preventDefault(); activatePane(key); });
  return card;
}

function icon(meta, key, group) {
  return h("div", { classes: ["awt-action-icon", `is-${group}`], children: [createIcon(meta.icon || key, group)] });
}

function copy(key, meta, group) {
  return h("div", { classes: ["awt-action-copy"], children: [
    h("strong", { text: meta.title || key }),
    h("span", { text: meta.desc || "Open this workspace." }),
    h("div", { classes: ["awt-card-meta"], children: metaChips(meta, group) })
  ] });
}

function metaChips(meta, group) {
  const chips = [chip(PAGE_GROUPS[group] || group || "Core", "group")];
  for (const badge of meta.badges || []) chips.push(chip(badge, badge));
  return chips;
}

function chip(label, kind) {
  return h("span", { classes: ["awt-card-chip", `is-${kind}`], text: label });
}
