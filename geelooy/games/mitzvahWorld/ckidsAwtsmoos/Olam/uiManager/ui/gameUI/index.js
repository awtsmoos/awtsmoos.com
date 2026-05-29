// B"H
/**
 * @file index.js
 * @description Chapter 46: The UI constellation refreshes again: top HUD,
 * ghostless action gate, and no stale blurred tower.
 */
import hud from "./hud.js?v=lean-l1-20260528-bh46";
import effectsOverlay from "../components/effectsOverlay.js?v=lean-l1-20260528-bh46";
import joystick from "../joystick.js?v=lean-l1-20260528-bh46";
import ActionBar from "./actionBar.js?v=lean-l1-20260528-bh46";
import InventoryScreen from "./inventory/index.js?v=lean-l1-20260528-bh46";
import InventoryStyle from "./inventory/style.js?v=lean-l1-20260528-bh46";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";
import { PerutahProgress } from "./perutahProgress.js?v=lean-l1-20260528-bh46";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const vessels = [hud, PerutahProgress, ActionBar, InventoryStyle, InventoryScreen, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike) vessels.push(...joystick);
export default vessels;
