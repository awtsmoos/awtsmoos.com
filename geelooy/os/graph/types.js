// B"H
export const OBJECT_TYPES = Object.freeze([
  "object", "desktop", "window", "process", "drive", "file", "folder",
  "preview", "mission", "terminal", "browser-tab", "display", "session",
  "input", "permission", "application", "notification", "device",
  "clipboard", "user", "ai", "mount", "transaction", "reference",
  "scene", "workspace", "taskbar"
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
 * The browser graph speaks the same nouns as the server mirror. Each noun is a
 * small throne: AI, clipboard, display, mount, taskbar, mission, and window.
 * No object wanders outside the palace without first receiving a name.
 */
