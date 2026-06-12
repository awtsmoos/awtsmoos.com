// B"H

import { el } from "./dom.js";
import { recordBeautyEvent } from "./events.js";
import { mountHealthRibbon } from "./healthRibbon.js";
import { mountActivityPulse } from "./activityPulse.js";
import { mountEventStream } from "./eventStream.js";
import { mountTimeline } from "./timeline.js";
import { mountWorkspaceMemory } from "./workspaceMemory.js";
import { mountFavorites } from "./favorites.js";
import { mountQuickActions } from "./quickActions.js";
import { mountBeautyCommandPalette } from "./commandPalette.js";
import { mountSpotlight } from "./spotlight.js";
import { mountSuggestions } from "./suggestions.js";
import { mountMissionMode } from "./missionMode.js";
import { mountAgentThinking } from "./agentThinking.js";
import { mountControlMap } from "./controlMap.js";
import { mountWorkspaceGraph } from "./workspaceGraph.js";
import { mountConstellation } from "./constellation.js";
import { mountPreviewDock } from "./previewDock.js";
import { mountDynamicAccent } from "./dynamicAccent.js";

/**
 * B"H
 * Chapter 408: Every Beauty Feature Gathered Into One Palace.
 */
export function mountBeautyLayer() {
  if (document.getElementById("awtBeautyLayer")) return;
  const root = el("aside", { attrs: { id: "awtBeautyLayer" }, classes: ["awt-beauty-layer"] });
  document.body.append(root);

  mountMissionMode();
  mountWorkspaceMemory();
  mountHealthRibbon(root);
  mountQuickActions(root);
  mountActivityPulse(root);
  mountSpotlight(root);
  mountFavorites(root);
  mountSuggestions(root);
  mountControlMap(root);
  mountWorkspaceGraph(root);
  mountConstellation(root);
  mountPreviewDock(root);
  mountAgentThinking(root);
  mountEventStream(root);
  mountTimeline(root);
  mountDynamicAccent();
  mountBeautyCommandPalette();
  wireRefreshBridge();
  recordBeautyEvent("boot", "Beauty control layer mounted");
}

function wireRefreshBridge() {
  document.addEventListener("awt:beauty-refresh", () => {
    document.getElementById("refreshBtn")?.click();
    document.getElementById("refreshDeviceBtn")?.click();
    recordBeautyEvent("refresh", "Requested status refresh");
  });
}
