// B"H
export const VERSION = "virtual-os-tunnel-1.6.0";

export const ACTIONS = Object.freeze([
  "snapshot", "scene", "graph", "graphSearch", "graphHistory",
  "graphReferences", "graphDiff", "graphTraverse", "graphTransaction",
  "graphSubscribe", "graphUnsubscribe", "graphWatchers", "graphWatchPoll",
  "objectGet", "objectUpsert", "objectDelete", "objectPathLookup",
  "vfsList", "vfsRead", "vfsWrite", "vfsMkdir", "vfsRemove",
  "vfsCan", "vfsMounts", "vfsResolve", "drives", "windows",
  "processes", "taskbar", "display", "input", "startMenu",
  "focusWindow", "toggleFullscreen", "openDrive"
]);

/**
 * B"H
 * The tunnel action list is the public song of the browser OS. VFS mutation
 * names now join the chorus, but only as gates into permissioned mounts, never
 * as a second secret filesystem.
 */
