// B"H
/**
 * @file index.js
 * @description
 * Chapter 6: The light HUD receives the repaired bag and spike overlay.
 *
 * This keeps the fast Level 1 pipeline while restoring inventory, action bar,
 * bag button, tooltip vessels, drag ghost, and the spike reset effect.
 */
import hud from "./hud.js";
import dialogues from "./dialogues.js";
import effectsOverlay from "../components/effectsOverlay.js?v=lean-l1-20260528-bh9";
import joystick from "../joystick.js";
import ActionBar from "./actionBar.js";
import InventoryScreen from "./inventory/index.js";
import initDragSystem from "./dragSystem.js";
import { DragGhost } from "./components/DragGhost.js";
import { Tooltips } from "./components/Tooltips.js";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";

if (typeof window !== "undefined") initDragSystem();

const uiVessels = [
  hud,
  ActionBar,
  InventoryScreen,
  DragGhost,
  ...Tooltips,
  ...dialogues,
  effectsOverlay,
  Toast,
  InteractionPrompt
];

if (typeof navigator !== "undefined" && navigator.userAgent.includes("Mobile")) uiVessels.push(...joystick);
export default uiVessels;
