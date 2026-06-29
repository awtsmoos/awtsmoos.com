// B"H
export const OBJECT_TYPES = Object.freeze([
  "object", "desktop", "window", "process", "drive", "file", "folder",
  "preview", "mission", "terminal", "browser-tab", "display", "session",
  "input", "permission", "application", "notification", "device",
  "clipboard", "user", "ai", "mount", "transaction", "reference",
  "scene", "workspace", "taskbar", "civilization", "feed", "post",
  "comment", "alias", "heichel", "event", "metric", "inspector"
]);

export const GRAPH_RIGHTS = Object.freeze([
  "read", "write", "control", "share", "delete", "watch"
]);

export function validType(type) {
  return OBJECT_TYPES.includes(type) ? type : "object";
}

export function normalizeList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return value ? [String(value)] : [];
}

/**
 * B"H
 * The graph now receives social life as native OS speech: feed, post, comment,
 * alias, heichel, event, metric, inspector, and civilization all enter the same
 * palace as drives, windows, sessions, mounts, and previews.
 */
