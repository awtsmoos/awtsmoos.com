// B"H

import { on } from "../platform/eventBus.js";
import { activatePane } from "../router/paneRouter.js";
import { loadBeautyState, rememberBeauty } from "./state.js";
import { recordBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 397: Workspace Memory Became A Gentle Return.
 */
export function mountWorkspaceMemory() {
  on("pane:opened", ({ detail }) => rememberBeauty("lastPane", detail.pane));
  document.addEventListener("awt:beauty-restore", () => {
    const pane = loadBeautyState().lastPane;
    if (pane) {
      activatePane(pane);
      recordBeautyEvent("memory", `Restored ${pane}`, { pane });
    }
  });
}
