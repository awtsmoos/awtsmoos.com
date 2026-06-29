// B"H
import { ACTIONS } from "./actions.js";
import { ok } from "./response.js";
import { basicSnapshot, startMenuItems, windowInfo } from "./domSnapshot.js";

export function createHandlers() {
  return {
    snapshot:() => ok("snapshot", window.os?.snapshot?.() || basicSnapshot()),
    scene:() => ok("scene", { scene:window.os?.scene?.() || basicSnapshot() }),
    graph:() => ok("graph", { graph:window.os?.graphSnapshot?.() || {} }),
    graphSearch:payload => ok("graphSearch", { results:window.os?.graph?.search?.(payload.query || payload.q || "") || [] }),
    graphHistory:payload => ok("graphHistory", { events:window.os?.graph?.history?.(payload) || [] }),
    graphReferences:payload => ok("graphReferences", { references:window.os?.graph?.references?.(payload.id) || {} }),
    graphDiff:payload => ok("graphDiff", { diff:window.os?.graph?.diff?.(payload.graph || payload.object || payload) || {} }),
    graphTraverse:payload => ok("graphTraverse", { traversal:window.os?.graph?.traverse?.(payload) || {} }),
    graphTransaction:payload => ok("graphTransaction", window.os?.graph?.transaction?.(payload.operations || []) || { ok:false }),
    objectGet:payload => ok("objectGet", { object:window.os?.graph?.get?.(payload.id) || null }),
    objectUpsert:payload => ok("objectUpsert", { object:window.os?.graph?.upsert?.(payload.object || payload) || null }),
    objectDelete:payload => ok("objectDelete", { deleted:window.os?.graph?.remove?.(payload.id) || null }),
    objectPathLookup:payload => ok("objectPathLookup", { object:window.os?.graph?.pathLookup?.(payload.path || payload.url || payload.id || payload.query || "") || null }),
    vfsList:async payload => ok("vfsList", { items:await window.os?.vfs?.list?.(payload.path || payload.p || "/") }),
    vfsRead:async payload => ok("vfsRead", { result:await window.os?.vfs?.read?.(payload.path || payload.p || "/") }),
    drives:() => ok("drives", { drives:window.os?.drives?.list?.() || [] }),
    windows:() => ok("windows", { windows:[...document.querySelectorAll(".window")].map(windowInfo) }),
    processes:() => ok("processes", { processes:window.os?.processes?.list?.() || [] }),
    taskbar:() => ok("taskbar", { taskbar:window.os?.taskbar?.snapshot?.() || {} }),
    display:() => ok("display", { display:window.os?.displaySnapshot?.() || {} }),
    input:payload => ok("input", { routed:window.os?.input?.(payload.inputType || payload.type || "remote", payload.data || payload) }),
    startMenu:() => ok("startMenu", { items:startMenuItems() }),
    focusWindow:focusWindow,
    openDrive:openDrive,
    toggleFullscreen:toggleFullscreen
  };
}

function focusWindow(payload) {
  const element = document.querySelector(payload.selector || `.window[data-id="${payload.id}"]`);
  if (!element) throw new Error("Window not found.");
  element.dispatchEvent(new MouseEvent("mousedown", { bubbles:true }));
  return ok("focusWindow", { focused:windowInfo(element) });
}

function openDrive(payload) {
  const path = payload.path || "awtsmoos://tunnels";
  window.os?.addWindow?.({ title:payload.title || "Remote Drive", path, os:window.os, programName:"awtsmoosFileExplorer" });
  return ok("openDrive", { path });
}

function toggleFullscreen() {
  window.os?.toggleFullScreen?.();
  return ok("toggleFullscreen", { fullscreen:!!document.fullscreenElement });
}

export function unsupported(action) {
  return { ok:false, error:"Unsupported virtual OS action", availableActions:ACTIONS, action };
}

/**
 * B"H
 * Handlers are the emissaries. They touch graph, VFS, display, process, input,
 * and window rooms, yet each returns through the same clear response gate.
 */
