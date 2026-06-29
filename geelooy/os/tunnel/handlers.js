// B"H
import { ACTIONS } from "./actions.js";
import { ok } from "./response.js";
import { basicSnapshot, startMenuItems, windowInfo } from "./domSnapshot.js";

const os = () => window.os || {};
const graph = () => os().graph || {};

export function createHandlers() {
  return {
    snapshot:() => ok("snapshot", os().snapshot?.() || basicSnapshot()),
    scene:() => ok("scene", { scene:os().scene?.() || basicSnapshot() }),
    graph:() => ok("graph", { graph:os().graphSnapshot?.() || {} }),
    graphSearch:payload => ok("graphSearch", { results:graph().search?.(payload.query || payload.q || "") || [] }),
    graphHistory:payload => ok("graphHistory", { events:graph().history?.(payload) || [] }),
    graphReferences:payload => ok("graphReferences", { references:graph().references?.(payload.id) || {} }),
    graphDiff:payload => ok("graphDiff", { diff:graph().diff?.(payload.graph || payload.object || payload) || {} }),
    graphTraverse:payload => ok("graphTraverse", { traversal:graph().traverse?.(payload) || {} }),
    graphTransaction:payload => ok("graphTransaction", graph().transaction?.(payload.operations || []) || { ok:false }),
    graphSubscribe:payload => ok("graphSubscribe", { watcher:graph().subscribe?.(payload.watcher || payload.watch || payload) || null }),
    graphUnsubscribe:payload => ok("graphUnsubscribe", { watcher:graph().unsubscribe?.(payload.watcherId || payload.id) || null }),
    graphWatchers:() => ok("graphWatchers", { watchers:graph().watchers?.() || [] }),
    graphWatchPoll:payload => ok("graphWatchPoll", { result:graph().drain?.(payload.watcherId || payload.id, payload.limit) || null }),
    objectGet:payload => ok("objectGet", { object:graph().get?.(payload.id) || null }),
    objectUpsert:payload => ok("objectUpsert", { object:graph().upsert?.(payload.object || payload) || null }),
    objectDelete:payload => ok("objectDelete", { deleted:graph().remove?.(payload.id) || null }),
    objectPathLookup:payload => ok("objectPathLookup", { object:graph().pathLookup?.(payload.path || payload.url || payload.id || payload.query || "") || null }),
    vfsList:async payload => ok("vfsList", { items:await os().vfs?.list?.(payload.path || payload.p || "/") }),
    vfsRead:async payload => ok("vfsRead", { result:await os().vfs?.read?.(payload.path || payload.p || "/") }),
    drives:() => ok("drives", { drives:os().drives?.list?.() || [] }),
    windows:() => ok("windows", { windows:[...document.querySelectorAll(".window")].map(windowInfo) }),
    processes:() => ok("processes", { processes:os().processes?.list?.() || [] }),
    taskbar:() => ok("taskbar", { taskbar:os().taskbar?.snapshot?.() || {} }),
    display:() => ok("display", { display:os().displaySnapshot?.() || {} }),
    input:payload => ok("input", { routed:os().input?.(payload.inputType || payload.type || "remote", payload.data || payload) }),
    startMenu:() => ok("startMenu", { items:startMenuItems() }),
    focusWindow:focusWindow,
    openDrive:openDrive,
    toggleFullscreen:toggleFullscreen
  };
}

function focusWindow(payload) { const element = document.querySelector(payload.selector || `.window[data-id="${payload.id}"]`); if (!element) throw new Error("Window not found."); element.dispatchEvent(new MouseEvent("mousedown", { bubbles:true })); return ok("focusWindow", { focused:windowInfo(element) }); }
function openDrive(payload) { const path = payload.path || "awtsmoos://tunnels"; os().addWindow?.({ title:payload.title || "Remote Drive", path, os:os(), programName:"awtsmoosFileExplorer" }); return ok("openDrive", { path }); }
function toggleFullscreen() { os().toggleFullScreen?.(); return ok("toggleFullscreen", { fullscreen:!!document.fullscreenElement }); }
export function unsupported(action) { return { ok:false, error:"Unsupported virtual OS action", availableActions:ACTIONS, action }; }
/** B"H: handlers now let remote watchers hear the local graph breathe. */
