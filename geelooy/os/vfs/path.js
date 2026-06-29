// B"H
export function normalizePath(path = "/") { return ("/" + String(path || "/").replace(/^\/+/, "")).replace(/\/+/g, "/"); }
export function joinPath(...parts) { return normalizePath(parts.join("/")); }
export function basename(path = "") { return normalizePath(path).split("/").filter(Boolean).pop() || "/"; }
