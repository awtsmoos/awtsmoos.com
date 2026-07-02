// B"H
export function parseAwtsmoosPath(path = "") {
  const text = String(path || "");
  if (text === "/network") return { kind:"tunnels", id:"", innerPath:".", raw:text, providerPath:true };
  if (text.startsWith("/network/")) {
    const [, , id = "", ...tail] = text.split("/");
    return { kind:"tunnels", id, innerPath:tail.join("/") || ".", raw:text, providerPath:true };
  }
  if (text === "/system/previews") return { kind:"previews", id:"", innerPath:".", raw:text, providerPath:true };
  if (text.startsWith("/system/previews/")) return { kind:"previews", id:text.split("/")[3] || "", innerPath:".", raw:text, providerPath:true };
  if (text === "/system/receipts" || text.startsWith("/system/receipts/")) return { kind:"receipts", id:"", innerPath:".", raw:text, providerPath:true };
  if (!text.startsWith("awtsmoos://")) return { kind:"local", path:text };
  const rest = text.slice("awtsmoos://".length);
  const [kind, id, ...tail] = rest.split("/");
  return { kind, id:id || "", innerPath:tail.join("/") || ".", raw:text };
}

export function isRemote(path = "") {
  const text = String(path || "");
  return text.startsWith("awtsmoos://") || text.startsWith("/network") || text.startsWith("/system/previews") || text.startsWith("/system/receipts");
}

/** B"H: provider paths and legacy URLs bend into one remote parsing gate. */
