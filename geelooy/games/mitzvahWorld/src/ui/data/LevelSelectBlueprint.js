// B"H
import { DivineActionMap } from "../actions/DivineActionMap.js";

/**
 * @file LevelSelectBlueprint.js
 * @description Chapter 59: newer UI path also requests JSON vessels only.
 */
export const LevelSelectBlueprint = {
  tag: "div",
  className: "awtsmoos-overlay",
  id: "awtsmoos-level-select-menu",
  children: [
    { tag: "div", className: "awtsmoos-title-container", children: [{ tag: "h1", className: "awtsmoos-main-title", text: "Desert Ladder" }] },
    { tag: "div", className: "awtsmoos-button-grid", children: [
      { tag: "button", className: "awtsmoos-btn", text: "1. Dust Gate", events: { click: () => DivineActionMap.execute("LOAD_WORLD", "ladder-1.json") } },
      { tag: "button", className: "awtsmoos-btn locked", text: "LOCKED - 2. Mirror Dunes", events: { click: () => alert('B"H\n2. Mirror Dunes is locked. Finish the first chamber first.') } },
      { tag: "button", className: "awtsmoos-btn locked", text: "LOCKED - 3. Argument Ruins", events: { click: () => alert('B"H\n3. Argument Ruins is locked. Finish the first chamber first.') } },
      { tag: "button", className: "awtsmoos-btn", text: "Back", events: { click: () => DivineActionMap.execute("GO_TO_MAIN_MENU") } }
    ] }
  ]
};
