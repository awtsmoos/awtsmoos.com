// B"H
import { ok } from "./response.js";
import { basicSnapshot, startMenuItems, windowInfo, WINDOW_SELECTOR } from "./domSnapshot.js";
import { currentOs } from "./osAccess.js";

export function desktopHandlers() {
  return {
    snapshot:() => ok("snapshot", os().snapshot?.() || basicSnapshot()),
    scene:() => ok("scene", { scene:os().scene?.() || basicSnapshot() }),
    windows:() => ok("windows", { windows:[...document.querySelectorAll(WINDOW_SELECTOR)].map(windowInfo) }),
    processes:() => ok("processes", { processes:os().processes?.list?.() || [] }),
    taskbar:() => ok("taskbar", { taskbar:os().taskbar?.snapshot?.() || {} }),
    display:() => ok("display", { display:os().displaySnapshot?.() || {} }),
    input:p => ok("input", { routed:os().input?.(p.inputType || p.type || "remote", p.data || p) }),
    startMenu:() => ok("startMenu", { items:startMenuItems() }),
    focusWindow,
    openDrive,
    toggleFullscreen
  };
}

function os() { return currentOs(); }

function focusWindow(p = {}) {
  const element = findWindowElement(p);
  if (!element) throw new Error("Window not found.");
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles:true }));
  return ok("focusWindow", { focused:windowInfo(element) });
}

function findWindowElement(p = {}) {
  if (p.selector) return document.querySelector(p.selector);
  if (!p.id) return null;
  const id = escapeWindowId(p.id);
  return document.querySelector(`${WINDOW_SELECTOR}[data-window-id="${id}"], ${WINDOW_SELECTOR}[data-id="${id}"]`);
}

function openDrive(p = {}) {
  const path = p.path || "awtsmoos://tunnels";
  os().addWindow?.({ title:p.title || "Remote Drive", path, os:os(), programName:"awtsmoosFileExplorer" });
  return ok("openDrive", { path });
}

function toggleFullscreen() {
  os().toggleFullScreen?.();
  return ok("toggleFullscreen", { fullscreen:!!document.fullscreenElement });
}

function escapeWindowId(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * B"H
 * Desktop handlers now speak the stable window contract: list, focus, and scene
 * snapshots all recognize the same `.window[data-window-id]` surface.
 */
