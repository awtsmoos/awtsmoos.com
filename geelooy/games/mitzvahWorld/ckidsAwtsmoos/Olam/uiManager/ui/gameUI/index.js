// B"H
/**
 * Master UI Index - Aggregating the spiritual vessels of interaction.
 */
import shlichusUI from "../shlichusUI.js";
import joystick from "../joystick.js";
import instructions from "../instructions.js";
import characterDesigner from "../characterDesigner.js"; 
import storeScreen from "../screens/storeScreen.js";
import effectsOverlay from "../components/effectsOverlay.js";
import questLog from "../screens/questLog.js";
import saveGameScreen from "../screens/saveGame.js";
import constructionScreen from "./constructionScreen.js"; 
import inputModal from "./inputModal.js";
import CommandConsole from "./CommandConsole.js"; 
import lavaMenu from "./lavaMenu.js"; 

import initDragSystem from "./dragSystem.js";
import topMenu from "./topMenu.js";
import dialogues from "./dialogues.js";
import { Saving, DragGhost, Tooltips, QuantityModal } from "./general.js";
import actionBar from "./actionBar.js";
import inventoryScreen from "./inventory/index.js";

// B"H: New Components
import apiKeyModal from "./apiKeyModal.js";
import hud from "./hud.js";

initDragSystem();

var ui = [
    hud, // B"H: Always visible HUD
    instructions, 
    topMenu,
    ...dialogues,
    Saving,
    DragGhost,
    QuantityModal,
    actionBar,
    inventoryScreen,
    ...Tooltips,
    characterDesigner, 
    storeScreen, 
    effectsOverlay, 
    questLog,
    saveGameScreen,
    constructionScreen,
    inputModal,
    CommandConsole,
    lavaMenu,
    apiKeyModal // B"H: Modal for keys
].concat(shlichusUI);

if (navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
}

export default ui;
