// B"H
import { windowsScene } from "./windowScene.js";
export function desktopScene(os) {
  return { kind:"geelooy-desktop-scene", version:1, at:new Date().toISOString(), title:document.title, path:os?.currentPathForRefresh || "/", drives:os?.drives?.list?.() || [], windows:windowsScene(os?.windowHandler), taskbar:os?.taskbar?.snapshot?.() || {}, fullscreen:!!document.fullscreenElement, viewport:{ width:innerWidth, height:innerHeight } };
}
