// B"H
/**
 * @file index.js
 * @description
 * Chapter 52: The missing prompt vessel returns to the UI river.
 * The Awtsmoos stops the console wound by restoring dialogues beside the HUD,
 * dock, inventory, joystick, and sacred interaction prompt.
 */
import hud from "./hud.js?v=lean-l1-20260528-bh52";
import effectsOverlay from "../components/effectsOverlay.js?v=lean-l1-20260528-bh52";
import joystick from "../joystick.js?v=lean-l1-20260528-bh52";
import ActionBar from "./actionBar.js?v=lean-l1-20260528-bh52";
import InventoryScreen from "./inventory/index.js?v=lean-l1-20260528-bh52";
import InventoryStyle from "./inventory/style.js?v=lean-l1-20260528-bh52";
import dialogues from "./dialogues.js?v=lean-l1-20260528-bh52";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";
import { PerutahProgress } from "./perutahProgress.js?v=lean-l1-20260528-bh52";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const vessels = [hud, PerutahProgress, ActionBar, InventoryStyle, InventoryScreen, ...dialogues, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike) vessels.push(...joystick);
export default vessels;
