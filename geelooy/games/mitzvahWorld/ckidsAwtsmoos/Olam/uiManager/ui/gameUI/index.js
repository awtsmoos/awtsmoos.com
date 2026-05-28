// B"H
/**
 * @file index.js (Game UI)
 * @description Lean Desert gameplay UI only.
 */
import hud from "./hud.js";
import dialogues from "./dialogues.js";
import effectsOverlay from "../components/effectsOverlay.js";
import joystick from "../joystick.js";
import { Toast } from "./components/Toast.js";
import { InteractionPrompt } from "./components/InteractionPrompt.js";

const uiVessels = [
    hud,
    ...dialogues,
    effectsOverlay,
    Toast,
    InteractionPrompt
];

if (typeof navigator !== "undefined" && navigator.userAgent.includes("Mobile")) {
    uiVessels.push(...joystick);
}

export default uiVessels;
