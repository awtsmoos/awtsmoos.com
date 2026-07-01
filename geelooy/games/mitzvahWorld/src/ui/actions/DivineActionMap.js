// B"H
function awtsmoosNotice(message) {
  const text = String(message ?? "");
  console.warn('B"H | NOTICE_NO_BLOCKING_DIALOG', text);
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ ||= [];
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.push({ at: Date.now(), text, source: import.meta?.url || "unknown" });
  globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__ = globalThis.__AWTSMOOS_SUPPRESSED_ALERTS__.slice(-80);
}
// B"H
import { MenuChariot } from "../MenuChariot.js";
import { GameAwtsmoosController } from "../../core/GameAwtsmoosController.js";

/** @file DivineActionMap.js @description Menu action router with direct world loads. */
export class DivineActionMap {
  static #actions = {
    GO_TO_LEVEL_SELECT:() => MenuChariot.manifestMenu("levelSelect"),
    GO_TO_MAIN_MENU:() => MenuChariot.manifestMenu("main"),
    LOAD_WORLD:worldId => { MenuChariot.clearAllMenues(); GameAwtsmoosController.initiateWorld(worldId || "village.json"); },
    SHOW_CONTROLS:() => awtsmoosNotice('B"H\nMove: WASD\nStrike: V\nTalk / Interact: F\nBag: B\nQuests / Map: L or M\nClear panels: ESC'),
    LOCKED_LEVEL:name => awtsmoosNotice(`B"H\n${name || "This level"} is locked.`),
    FIND_ALIAS:() => awtsmoosNotice('B"H\nAlias search is not active in this build.'),
    LOAD_FILE:() => awtsmoosNotice('B"H\nLocal scroll loading is not active in this build.')
  };

  static execute(actionKey, payload = null) {
    const action = this.#actions[actionKey];
    if (typeof action === "function") return action(payload);
    console.warn(`B"H - The action '${actionKey}' has no vessel in this realm.`);
    return null;
  }
}
