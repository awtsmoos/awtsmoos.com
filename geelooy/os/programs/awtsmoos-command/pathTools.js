// B"H
import { isAwtsmoosUrl, joinProviderPath, nameFromProviderPath, normalizeProviderPath, parentProviderPath, providerFromPath } from "../../providers/providerPath.js";

export function resolvePath(cwd = "/", value = "") {
  const raw = String(value || "").trim();
  if (!raw || raw === ".") return normalizeProviderPath(cwd || "/");
  if (raw === "..") return dirname(cwd);
  if (isAwtsmoosUrl(raw) || raw.startsWith("/")) return normalizeProviderPath(raw);
  return joinProviderPath(cwd || "/", raw);
}

export function dirname(path = "/") { return parentProviderPath(path); }
export function basename(path = "") { return nameFromProviderPath(path); }
export function providerOfPath(path = "/") { return providerFromPath(path); }

/** B"H: shell paths now climb provider branches, not local/remote ladders. */
