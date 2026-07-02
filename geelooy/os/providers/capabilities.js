// B"H
const BASE = ["open", "inspect", "bookmark", "history"];
const TABLE = {
  virtual:["children", "search", "watch", "preview", "share"],
  memory:["children", "search", "write", "delete", "history"],
  local:["children", "read", "write", "delete", "move", "copy", "watch", "execute", "permissions", "trash"],
  tunnel:["children", "read", "write", "delete", "move", "copy", "watch", "execute", "stream", "tail", "terminal"],
  ssh:["children", "read", "write", "execute", "stream", "terminal", "permissions"],
  git:["children", "read", "history", "diff", "restore", "branch", "timeline"],
  zip:["children", "read", "preview", "extract", "compress"],
  api:["children", "read", "search", "stream", "preview"],
  preview:["read", "preview", "share", "inspect"],
  receipt:["read", "history", "inspect"],
  generated:["read", "write", "preview", "regenerate"]
};

export function providerKind(input = {}) {
  return input.provider || input.providerKind || input.adapterType || input.kind || "virtual";
}

export function providerCapabilities(input = {}) {
  const kind = providerKind(input);
  const explicit = Array.isArray(input.capabilities) ? input.capabilities : [];
  return [...new Set([...BASE, ...(TABLE[kind] || TABLE.virtual), ...explicit])];
}

export function can(input = {}, capability = "") {
  return providerCapabilities(input).includes(capability);
}

export function capabilityRecord(input = {}) {
  return Object.fromEntries(providerCapabilities(input).map(name => [name, true]));
}

/**
 * B"H
 * The Awtsmoos breathes through capability, not category. A folder does not ask
 * whether the river is local or remote; it asks what light may flow here now.
 */
