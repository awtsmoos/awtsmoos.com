// B"H
/**
 * @file index.js
 * @description Chapter 438: collective skin imports the renewed loading vortex.
 */
import inventory from "./inventory.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import login from "./login.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import dialogue from "./dialogue.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import mainMenu from "./mainMenu.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import loading from "./loading.js?compact=true&v=multi-progress-texture-cache-20260614-bh1";
import inGameMenu from "./inGameMenu.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import instructions from "./instructions.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import shlichus from "./shlichus.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import actionBars from "./actionBars.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import characterDesignerStyle from "./characterDesignerStyle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import store from "./store.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import effects from "./effects.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import saveGameStyle from "./saveGameStyle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import levelSelectStyle from "./levelSelectStyle.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default /*css*/`
  /* B"H */
  ${inventory}
  ${login}
  ${mainMenu}
  ${dialogue}
  ${loading}
  ${inGameMenu}
  ${instructions}
  ${shlichus}
  ${actionBars}
  ${characterDesignerStyle}
  ${store}
  ${effects}
  ${saveGameStyle}
  ${levelSelectStyle}
`;
