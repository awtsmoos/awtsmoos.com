// B"H

import { loadBeautyState, rememberBeauty } from "./state.js";
import { recordBeautyEvent } from "./events.js";

/**
 * B"H
 * Chapter 403: Mission Mode Became A Curtain Of Focus.
 */
export function mountMissionMode() {
  apply(loadBeautyState().mission);
  document.addEventListener("awt:beauty-toggle-mission", () => {
    const next = !document.body.classList.contains("awt-mission-mode");
    rememberBeauty("mission", next);
    apply(next);
    recordBeautyEvent("mission", next ? "Mission mode enabled" : "Mission mode disabled");
  });
}

function apply(enabled) {
  document.body.classList.toggle("awt-mission-mode", !!enabled);
}
