// B"H
import { DivineActionMap } from "../actions/DivineActionMap.js";

/** @file MainMenuBlueprint.js @description Direct world entry buttons. */
export const MainMenuBlueprint = {
  tag:"div", className:"awtsmoos-overlay", id:"awtsmoos-main-menu",
  children:[
    { tag:"div", className:"awtsmoos-particles", id:"awtsmoos-particle-layer" },
    { tag:"div", className:"awtsmoos-title-container", children:[
      { tag:"h1", className:"awtsmoos-main-title", text:"MITZVAH WORLD" },
      { tag:"h2", className:"awtsmoos-sub-title", text:"Living Village" }
    ] },
    { tag:"div", className:"awtsmoos-button-grid", children:[
      { tag:"button", className:"awtsmoos-btn", text:"PLAY WORLD", events:{ click:() => DivineActionMap.execute("LOAD_WORLD", "village.json") } },
      { tag:"button", className:"awtsmoos-btn", text:"WORLD STUDIO", events:{ click:() => DivineActionMap.execute("OPEN_WORLD_STUDIO") } },
      { tag:"button", className:"awtsmoos-btn", text:"MOVIE MAKER", events:{ click:() => DivineActionMap.execute("OPEN_MOVIE_MAKER") } },
      { tag:"button", className:"awtsmoos-btn", text:"DESERT LADDER", events:{ click:() => DivineActionMap.execute("LOAD_WORLD", "ladder-1.json") } },
      { tag:"button", className:"awtsmoos-btn", text:"LEVEL SELECT", events:{ click:() => DivineActionMap.execute("GO_TO_LEVEL_SELECT") } },
      { tag:"button", className:"awtsmoos-btn", text:"CONTROLS", events:{ click:() => DivineActionMap.execute("SHOW_CONTROLS") } }
    ] }
  ]
};
