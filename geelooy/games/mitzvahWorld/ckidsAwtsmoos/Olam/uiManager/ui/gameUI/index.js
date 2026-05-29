// B"H
/**
 * @file index.js
 * @description Chapter 75: The HUD river receives the wide-platform boot key.
 * The Awtsmoos keeps the visible UI in the same refreshed chain as the worker
 * start event so no old UI vessel whispers stale module names.
 */
import hud from "./hud.js?v=wide-platform-real-boot-chain-20260529-bh75";
import effectsOverlay from "../components/effectsOverlay.js?v=wide-platform-real-boot-chain-20260529-bh75";
import joystick from "../joystick.js?v=wide-platform-real-boot-chain-20260529-bh75";
import ActionBar from "./actionBar.js?v=wide-platform-real-boot-chain-20260529-bh75";
import InventoryScreen from "./inventory/index.js?v=wide-platform-real-boot-chain-20260529-bh75";
import InventoryStyle from "./inventory/style.js?v=wide-platform-real-boot-chain-20260529-bh75";
import dialogues from "./dialogues.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { Toast } from "./components/Toast.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { InteractionPrompt } from "./components/InteractionPrompt.js?v=wide-platform-real-boot-chain-20260529-bh75";
import { PerutahProgress } from "./perutahProgress.js?v=wide-platform-real-boot-chain-20260529-bh75";

const isMobileLike = typeof navigator !== "undefined" && /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
const vessels = [hud, PerutahProgress, ActionBar, InventoryStyle, InventoryScreen, ...dialogues, effectsOverlay, Toast, InteractionPrompt];
if (isMobileLike) vessels.push(...joystick);
export default vessels;
