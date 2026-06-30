// B"H
/** @file installUiBridge.js @description Installs DOM bridge, dock, panel controls, and message bridge. */
import { closePanel, togglePanel, uiState } from "./domCore.js";
import { safeClone } from "./safeClone.js";
import { openLoot, lootAll, lootNearestCarcass } from "./lootActions.js";
import { installNavDock, closeAllPanels } from "./navDock.js";
import { rendererMap } from "./renderers.js";
export function installUiBridge() { const renderers = rendererMap(); uiState(); globalThis.__MITZVAH_CLOSE_PANEL__ = closePanel; globalThis.__MITZVAH_TOGGLE_PANEL__ = togglePanel; globalThis.__MITZVAH_CHOOSE_NPC__ = (npcId, choiceId) => globalThis.__MITZVAH_NPC_INTERACTION__?.choose?.(npcId, choiceId); globalThis.__MITZVAH_OPEN_LOOT__ = openLoot; globalThis.__MITZVAH_LOOT_ALL__ = lootAll; globalThis.__MITZVAH_LOOT_NEAREST_CARCASS__ = lootNearestCarcass; globalThis.__MITZVAH_UI_BRIDGE__ = { receive(name, payload) { uiState()[name] = safeClone(payload); renderers[name]?.(payload || {}); return true; }, state:uiState() }; installNavDock(); window.addEventListener("keydown", event => { if (event.code === "Escape") closeAllPanels(); }); window.addEventListener("message", event => { const data = event.data || {}; if (data.type === "ui event" && data.name) globalThis.__MITZVAH_UI_BRIDGE__.receive(data.name, data.payload); }); return globalThis.__MITZVAH_UI_BRIDGE__; }
