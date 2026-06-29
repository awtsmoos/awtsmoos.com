// B"H
import { ok } from "./response.js";
import { basicSnapshot, startMenuItems, windowInfo } from "./domSnapshot.js";
import { currentOs } from "./osAccess.js";

export function desktopHandlers() {
  return {
    snapshot:() => ok("snapshot", os().snapshot?.() || basicSnapshot()),
    scene:() => ok("scene", { scene:os().scene?.() || basicSnapshot() }),
    windows:() => ok("windows", { windows:[...document.querySelectorAll(".window")].map(windowInfo) }),
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
function focusWindow(p) { const element = document.querySelector(p.selector || `.window[data-id="${p.id}"]`); if (!element) throw new Error("Window not found."); element.dispatchEvent(new MouseEvent("mousedown", { bubbles:true })); return ok("focusWindow", { focused:windowInfo(element) }); }
function openDrive(p) { const path = p.path || "awtsmoos://tunnels"; os().addWindow?.({ title:p.title || "Remote Drive", path, os:os(), programName:"awtsmoosFileExplorer" }); return ok("openDrive", { path }); }
function toggleFullscreen() { os().toggleFullScreen?.(); return ok("toggleFullscreen", { fullscreen:!!document.fullscreenElement }); }
/** B"H: desktop handlers tend the visible city: windows, display, input, and start gates. */
