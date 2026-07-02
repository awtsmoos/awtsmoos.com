// B"H
export const LEGACY_TUNNELS = "awtsmoos://tunnels";
export const LEGACY_PREVIEWS = "awtsmoos://previews";
export const LEGACY_RECEIPTS = "awtsmoos://receipts";

export function isAwtsmoosUrl(path = "") { return String(path || "").startsWith("awtsmoos://"); }

export function providerFromPath(path = "/") {
  const value = String(path || "/");
  if (value.startsWith(LEGACY_TUNNELS) || value.startsWith("/network")) return "tunnel";
  if (value.startsWith(LEGACY_PREVIEWS) || value.startsWith("/system/previews")) return "preview";
  if (value.startsWith(LEGACY_RECEIPTS) || value.startsWith("/system/receipts")) return "receipt";
  if (value.startsWith("awtsmoos://git") || value.startsWith("/projects/git")) return "git";
  if (value.startsWith("/memory") || value.startsWith("awtsmoos://memory")) return "memory";
  return "virtual";
}

export function normalizeProviderPath(path = "/") {
  const text = String(path || "/").trim() || "/";
  if (isAwtsmoosUrl(text)) return normalizeAwtsmoosUrl(text);
  return (`/${text.replace(/^\/+/, "")}`).replace(/\/+/g, "/") || "/";
}

export function joinProviderPath(path = "/", name = "") {
  const base = normalizeProviderPath(path);
  const tail = String(name || "").split("/").filter(Boolean).join("/");
  if (!tail) return base;
  if (isAwtsmoosUrl(base)) return `${base.replace(/\/+$/, "")}/${tail}`;
  return normalizeProviderPath(`${base}/${tail}`);
}

export function parentProviderPath(path = "/") {
  const value = normalizeProviderPath(path);
  if (value === "/") return "/";
  if (isAwtsmoosUrl(value)) {
    const [scheme, rest = ""] = value.split("//");
    const parts = rest.split("/").filter(Boolean);
    if (parts.length <= 1) return value;
    return `${scheme}//${parts.slice(0, -1).join("/")}`;
  }
  const parts = value.split("/").filter(Boolean);
  return parts.length <= 1 ? "/" : `/${parts.slice(0, -1).join("/")}`;
}

export function nameFromProviderPath(path = "") {
  const value = normalizeProviderPath(path);
  const parts = isAwtsmoosUrl(value) ? value.split("//")[1].split("/") : value.split("/");
  return parts.filter(Boolean).pop() || "/";
}

function normalizeAwtsmoosUrl(url = "") {
  const rest = String(url).slice("awtsmoos://".length).split("/").filter(Boolean).join("/");
  return rest ? `awtsmoos://${rest}` : "awtsmoos://";
}

/** B"H: a path is not remote or local; it is a provider-song with a route. */
