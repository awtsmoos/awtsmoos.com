// B"H
/**
 * @file index.js
 * @description
 * Chapter 12: The light HUD receives the coin counter and reset veil.
 *
 * The Awtsmoos counts copper moons through `perutahProgress`, while the spike
 * veil still explodes letters through `effectsOverlay`. This index is the small
 * clean table of UI vessels: no shops, no dialogue generators, no heavy world.
 */
import hud from "./hud.js?v=lean-l1-20260528-bh17";
import dialogues from "./dialogues.js";
import effectsOverlay from "../components/effectsOverlay.js?v=lean-l1-20260528-bh17";
import joystick from "../joystick.js";
import ActionBar from "./actionBar.js";
import InventoryScreen from "./inventory/index.js";
import initDragSystem from "./dragSystem.js";
import { DragGhost } from "./components/DragGhost.js";
import { Tooltips } from "./components/Tooltips.js";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";
import { PerutahProgress } from "./perutahProgress.js?v=lean-l1-20260528-bh17";

if (typeof window !== "undefined") initDragSystem();

const uiVessels = [
  hud,
  PerutahProgress,
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
