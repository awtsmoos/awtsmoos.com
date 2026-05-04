
/**
 * @file index.js (Game UI)
 * @description
 * THE ASSEMBLY OF THE SENSES
 * 
 * Chapter 50: The Integration of Kelim.
 * This is the grand unification of all UI components. Each module 
 * represents a specific "sense" or "limb" of the interaction layer.
 * From the HUD (Eyes) to the Inventory (Hands).
 */
import shlichusUI from "../shlichusUI.js";
import joystick from "../joystick.js";
import instructions from "../instructions.js";
import characterDesigner from "../characterDesigner.js"; 
import storeScreen from "../screens/storeScreen.js";
import effectsOverlay from "../components/effectsOverlay.js";
import ShlichusBook from "./ShlichusBook.js";
import saveGameScreen from "../screens/saveGame.js";

import constructionScreen from "./constructionScreen.js"; 
import inputModal from "./inputModal.js";
import CommandConsole from "./CommandConsole.js"; 
import lavaMenu from "./lavaMenu.js"; 
import levelSelectScreen from "../screens/levelSelect.js"; 

import initDragSystem from "./dragSystem.js";
import topMenu from "./topMenu.js";
import dialogues from "./dialogues.js";

// B"H: Modular components of the Matrix
import { Saving } from "./components/Saving.js";
import { DragGhost } from "./components/DragGhost.js";
import { QuantityModal } from "./components/QuantityModal.js";
import { Tooltips } from "./components/Tooltips.js";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";

import ZroaYamin from "./ZroaYamin/index.js";
import Otzar from "./Otzar/index.js";
import { ItemContextMenu } from "./Otzar/ContextMenu/index.js";
import apiKeyModal from "./apiKeyModal.js";
import knowledgeMenu from "./knowledgeMenu.js";
import hud from "./hud.js";

import skillBar from "./skillBar.js";
import VisualEditor from "./VisualEditor.js"; 

// B"H: The pulse of the drag system awakened in the Main Thread
if (typeof window !== 'undefined') {
    initDragSystem();
}

/**
 * @type {Array} 
 * The Array of potential vessels. Order matters for z-index layering.
 */
const uiVessels = [
    hud, 
    skillBar, 
    knowledgeMenu, // 📖 SEFER HAMITZVOS
    instructions, 


    ...dialogues,
    Saving,
    DragGhost,
    QuantityModal,
    ZroaYamin,
    Otzar,
    ...Tooltips,
    characterDesigner, 
    storeScreen, 
    effectsOverlay, 
    ShlichusBook,
    saveGameScreen,
    constructionScreen,
    inputModal,
    CommandConsole,
    lavaMenu,
    apiKeyModal,
    VisualEditor,
    levelSelectScreen,
    ItemContextMenu,
    Toast,
    InteractionPrompt
].concat(shlichusUI);


// B"H: Mobile specific appendages
if (typeof navigator !== 'undefined' && navigator.userAgent.includes("Mobile")) {
    uiVessels.push(...joystick);
}

export default uiVessels;
