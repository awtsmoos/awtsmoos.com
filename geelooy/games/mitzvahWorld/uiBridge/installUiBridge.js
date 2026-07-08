// B"H
/**
 * @file installUiBridge.js
 * @purpose Installs the DOM bridge without creating a duplicate action dock.
 * @owner Live mitzvahWorld UI bridge runtime.
 * @inputs Worker UI event messages, loot actions, and panel renderer map.
 * @outputs Global bridge API and Escape cleanup behavior.
 * @runtimeAuthority Bridge events only; canonical actions belong to Olam gameUI/actionBar.js.
 * @updateOrder Install globals, renderer bridge, keyboard cleanup, then message listener.
 * @callers uiBridge/bootIkar.js during browser boot.
 * @invariants Never imports or calls installNavDock; no duplicate action bar owner.
 * @failureModes Unknown event names are stored and ignored without throwing.
 */
import { closePanel, togglePanel, uiState } from "./domCore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { safeClone } from "./safeClone.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { openLoot, lootAll, lootNearestCarcass } from "./lootActions.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { closeAllPanels } from "./closePanels.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { rendererMap } from "./renderers.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";

export function installUiBridge() {
  const renderers = rendererMap();
  uiState();
  globalThis.__MITZVAH_CLOSE_PANEL__ = closePanel;
  globalThis.__MITZVAH_TOGGLE_PANEL__ = togglePanel;
  globalThis.__MITZVAH_CHOOSE_NPC__ = (npcId, choiceId) =>
    globalThis.__MITZVAH_NPC_INTERACTION__?.choose?.(npcId, choiceId);
  globalThis.__MITZVAH_OPEN_LOOT__ = openLoot;
  globalThis.__MITZVAH_LOOT_ALL__ = lootAll;
  globalThis.__MITZVAH_LOOT_NEAREST_CARCASS__ = lootNearestCarcass;
  globalThis.__MITZVAH_UI_BRIDGE__ = {
    receive(name, payload) {
      uiState()[name] = safeClone(payload);
      renderers[name]?.(payload || {});
      return true;
    },
    state: uiState()
  };
  window.addEventListener("keydown", event => {
    if (event.code === "Escape") closeAllPanels();
  });
  window.addEventListener("message", event => {
    const data = event.data || {};
    if (data.type === "ui event" && data.name) {
      globalThis.__MITZVAH_UI_BRIDGE__.receive(data.name, data.payload);
    }
  });
  return globalThis.__MITZVAH_UI_BRIDGE__;
}
