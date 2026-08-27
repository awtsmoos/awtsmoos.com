// B"H

import { PAGE_SPECS } from "../shell/pageSpecs.js";
import { activatePane, showHome } from "../router/paneRouter.js";
import { recordBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 392: Actions Became Named Doors.
 */
export function baseActions() {
  const panes = PAGE_SPECS.map(page => ({
    id: `open:${page.key}`,
    label: `Open ${page.title}`,
    hint: page.desc || page.group,
    group: page.group,
    run: () => activateBeautyPane(page.key)
  }));

  return [
    { id: "home", label: "Return home", hint: "Dashboard", group: "core", run: () => { showHome(); recordBeautyEvent("nav", "Returned home"); } },
    { id: "refresh", label: "Refresh status", hint: "Auth and device", group: "system", run: () => document.dispatchEvent(new CustomEvent("awt:beauty-refresh")) },
    { id: "restore", label: "Restore last workspace", hint: "Workspace memory", group: "core", run: () => document.dispatchEvent(new CustomEvent("awt:beauty-restore")) },
    { id: "mission", label: "Toggle mission mode", hint: "Focus workspace", group: "core", run: () => document.dispatchEvent(new CustomEvent("awt:beauty-toggle-mission")) },
    ...panes
  ];
}

export function activateBeautyPane(key) {
  activatePane(key);
  recordBeautyEvent("pane", `Opened ${key}`, { pane: key });
}

export function findAction(query) {
  const q = String(query || "").toLowerCase();
  return baseActions().filter(action => `${action.label} ${action.hint} ${action.group}`.toLowerCase().includes(q));
}
