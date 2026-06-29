// B"H
import { desktopScene } from "./desktopScene.js";
export function serializeScene(os) { return JSON.parse(JSON.stringify(desktopScene(os))); }
export function sceneText(os) { return JSON.stringify(serializeScene(os), null, 2); }
