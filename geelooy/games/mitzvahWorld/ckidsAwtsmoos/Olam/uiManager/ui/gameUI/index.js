// B"H
/**
 * B"H
 * UI components that involve the in game experience
 */
import shlichusUI from "../shlichusUI.js";
import joystick from "../joystick.js";
import instructions from "../instructions.js";
import characterDesigner from "../characterDesigner.js"; 
import storeScreen from "../screens/storeScreen.js";
import effectsOverlay from "../components/effectsOverlay.js";
import questLog from "../screens/questLog.js";

import initDragSystem from "./dragSystem.js";
import topMenu from "./topMenu.js";
import dialogues from "./dialogues.js";
import { Saving, DragGhost, Tooltips, QuantityModal } from "./general.js";
import actionBar from "./actionBar.js";
import inventoryScreen from "./inventory.js";

// Initialize drag listeners globally
initDragSystem();

var ui = [
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
    questLog
].concat(shlichusUI);

if (navigator.userAgent.includes("Mobile")) {
    ui = ui.concat(joystick);
}

export default ui;