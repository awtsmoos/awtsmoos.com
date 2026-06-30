// B"H
import { DivineActionMap } from "../actions/DivineActionMap.js";

/** @file LevelSelectBlueprint.js @description Simple playable level list. */
export const LevelSelectBlueprint = {
  tag:"div", className:"awtsmoos-overlay", id:"awtsmoos-level-select-menu",
  children:[
    { tag:"div", className:"awtsmoos-title-container", children:[{ tag:"h1", className:"awtsmoos-main-title", text:"LEVEL SELECT" }] },
    { tag:"div", className:"awtsmoos-button-grid", children:[
      { tag:"button", className:"awtsmoos-btn", text:"Village", events:{ click:() => DivineActionMap.execute("LOAD_WORLD", "village.json") } },
      { tag:"button", className:"awtsmoos-btn", text:"Ladder 1", events:{ click:() => DivineActionMap.execute("LOAD_WORLD", "ladder-1.json") } },
      { tag:"button", className:"awtsmoos-btn locked", text:"LOCKED - Ladder 2", events:{ click:() => DivineActionMap.execute("LOCKED_LEVEL", "Ladder 2") } },
      { tag:"button", className:"awtsmoos-btn locked", text:"LOCKED - Future Worlds", events:{ click:() => DivineActionMap.execute("LOCKED_LEVEL", "Future Worlds") } },
      { tag:"button", className:"awtsmoos-btn", text:"Back", events:{ click:() => DivineActionMap.execute("GO_TO_MAIN_MENU") } }
    ] }
  ]
};
