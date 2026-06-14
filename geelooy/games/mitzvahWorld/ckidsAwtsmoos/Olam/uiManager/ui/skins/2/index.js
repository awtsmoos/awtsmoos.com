// B"H
/**
 * @file index.js
 * @description Chapter 438: collective skin imports the renewed loading vortex.
 */
import inventory from "./inventory.js";
import login from "./login.js";
import dialogue from "./dialogue.js";
import mainMenu from "./mainMenu.js";
import loading from "./loading.js?v=multi-progress-texture-cache-20260614-bh1";
import inGameMenu from "./inGameMenu.js";
import instructions from "./instructions.js";
import shlichus from "./shlichus.js";
import actionBars from "./actionBars.js";
import characterDesignerStyle from "./characterDesignerStyle.js";
import store from "./store.js";
import effects from "./effects.js";
import saveGameStyle from "./saveGameStyle.js";
import levelSelectStyle from "./levelSelectStyle.js";
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
