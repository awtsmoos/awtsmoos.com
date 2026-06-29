// B"H
export const VERSION = "virtual-os-tunnel-1.4.0";

export const ACTIONS = Object.freeze([
  "snapshot", "scene", "graph", "graphSearch", "graphHistory",
  "graphReferences", "graphDiff", "graphTraverse", "graphTransaction",
  "graphSubscribe", "graphUnsubscribe", "graphWatchers", "graphWatchPoll",
  "objectGet", "objectUpsert", "objectDelete", "objectPathLookup",
  "vfsList", "vfsRead", "drives", "windows", "processes", "taskbar",
  "display", "input", "startMenu", "focusWindow", "toggleFullscreen", "openDrive"
]);

/**
 * B"H
 * The tunnel action list is the public song of the browser OS. If an action is
 * real, it is named here; watchers now join the chorus for live graph change.
 */
