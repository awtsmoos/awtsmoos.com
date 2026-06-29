// B"H
export function objectId(type = "object") { return `${type}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`; }
export function stableId(type, key) { return `${type}:${String(key || "root").replace(/[^a-z0-9._:-]+/gi, "-")}`; }
