// B"H
/** @file MainMenuStructure.js @description Alternate generated main menu schema. */
export const getMainMenuStructure = delegations => ({
  sefirahTag:"div", sealId:"epicMenuGate", garments:["olam-menu-vessel"],
  childEmanations:[
    { sefirahTag:"h1", garments:["main-divine-title"], innerLight:"MITZVAH WORLD" },
    { sefirahTag:"div", garments:["sefirotic-btn-group"], childEmanations:[
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"PLAY WORLD", onAwakeningEvents:{ click:delegations.enterVillage || delegations.invokeGenesis } },
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"WORLD STUDIO", onAwakeningEvents:{ click:delegations.openWorldStudio || delegations.invokeWorldStudio || delegations.invokeFindWorld } },
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"MOVIE MAKER", onAwakeningEvents:{ click:delegations.openMovieMaker || delegations.invokeMovieMaker || delegations.invokeWorldStudio || delegations.invokeFindWorld } },
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"DESERT LADDER", onAwakeningEvents:{ click:delegations.enterDesert || delegations.invokeGenesis } },
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"LEVEL SELECT", onAwakeningEvents:{ click:delegations.openLevelSelect || delegations.invokeFindWorld } },
      { sefirahTag:"button", garments:["mitzvah-btn-extreme"], innerLight:"CONTROLS", onAwakeningEvents:{ click:delegations.showControls || delegations.invokeLoadFile } }
    ] },
    { sefirahTag:"div", garments:["footer-sig"], innerLight:'B"H - What you see is what exists.' }
  ]
});
