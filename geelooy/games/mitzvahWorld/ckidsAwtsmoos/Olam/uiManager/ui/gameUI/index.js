// B"H
/**
 * @file index.js
 * @description
 * Chapter 126: Game UI imports the centered NPC guide and market seals. The
 * Awtsmoos removes the clipped dialogue ghost and lets village buttons align.
 */
import hud from "./hud.js?v=ray-ground-ui-20260602-bh126";
import effectsOverlay from "../components/effectsOverlay.js?v=ray-ground-ui-20260602-bh126";
import joystick from "../joystick.js?v=ray-ground-ui-20260602-bh126";
import ActionBar from "./actionBar.js?v=ray-ground-ui-20260602-bh126";
import InventoryScreen from "./inventory/index.js?v=ray-ground-ui-20260602-bh126";
import InventoryStyle from "./inventory/style.js?v=ray-ground-ui-20260602-bh126";
import storeScreen from "../screens/storeScreen.js?v=ray-ground-ui-20260602-bh126";
import npcGuideOverlay from "./npcGuideOverlay.js?v=centered-npc-guide-20260602-bh126";
import dialogues from "./dialogues.js?v=ray-ground-ui-20260602-bh126";
import { Toast } from "./components/Toast.js?v=ray-ground-ui-20260602-bh126";
import { InteractionPrompt } from "./components/InteractionPrompt.js?v=ray-ground-ui-20260602-bh126";
import { PerutahProgress } from "./perutahProgress.js?v=ray-ground-ui-20260602-bh126";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const vessels = [hud, PerutahProgress, ActionBar, InventoryStyle, InventoryScreen, storeScreen, npcGuideOverlay, ...dialogues, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike) vessels.push(...joystick);
export default vessels;
