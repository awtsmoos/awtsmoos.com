// B"H
/**
 * @file index.js
 * @description
 * Chapter 651: Game UI imports the mission card born from level presentation.
 *
 * The Awtsmoos gives each world a purpose. The UI now includes the levelMission
 * vessel beside HUD, progress, joystick, overlays, inventory, and prompts.
 */
import hud from "./hud.js?v=mission-card-ui-20260610-bh711";
import missionCard from "./missionCard.js?v=village-polish-20260612-bh810";
import unitFrames from "./unitFrames.js?v=village-polish-20260612-bh810";
import effectsOverlay from "../components/effectsOverlay.js?v=ray-ground-ui-20260602-bh126";
import joystick from "../joystick.js?v=ray-ground-ui-20260602-bh126";
import ActionBar from "./actionBar.js?v=village-combat-20260611-bh806";
import InventoryScreen from "./inventory/index.js?v=ray-ground-ui-20260602-bh126";
import InventoryStyle from "./inventory/style.js?v=ray-ground-ui-20260602-bh126";
import storeScreen from "../screens/storeScreen.js?v=ray-ground-ui-20260602-bh126";
import npcGuideOverlay from "./npcGuideOverlay.js?v=ui-glass-click-proof-20260603-bh366";
import dialogues from "./dialogues.js?v=village-combat-20260611-bh805";
import { Toast } from "./components/Toast.js?v=ray-ground-ui-20260602-bh126";
import { InteractionPrompt } from "./components/InteractionPrompt.js?v=ray-ground-ui-20260602-bh126";
import { PerutahProgress } from "./perutahProgress.js?v=village-hud-born-hidden-20260603-bh366";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const vessels = [hud, unitFrames, missionCard, PerutahProgress, ActionBar, InventoryStyle, InventoryScreen, storeScreen, npcGuideOverlay, ...dialogues, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike) vessels.push(...joystick);
export default vessels;
