// B"H
import { isAwtsmoosUrl, joinProviderPath, nameFromProviderPath, normalizeProviderPath, parentProviderPath, providerFromPath } from "../../../providers/providerPath.js";

export function pathProvider(path = "/") { return providerFromPath(path); }
export function isProviderUrl(path = "") { return isAwtsmoosUrl(path); }

export function isRemotePath(path = "") {
  return ["tunnel", "preview", "receipt", "api", "ssh"].includes(providerFromPath(path));
}

export function normalizeExplorerPath(path = "/") { return normalizeProviderPath(path); }
export function joinExplorerPath(path = "/", name = "") { return joinProviderPath(path, name); }
export function parentExplorerPath(path = "/") { return parentProviderPath(path); }
export function nameFromPath(path = "") { return nameFromProviderPath(path); }

export function extensionOf(name = "") {
  const clean = String(name || "").toLowerCase();
  if (!clean || clean.endsWith(".folder")) return "";
  const last = clean.split("/").pop() || clean;
  const dot = last.lastIndexOf(".");
  return dot > 0 ? last.slice(dot + 1).replace(/[^a-z0-9-]/g, "") : "";
}

/** B"H: compatibility remains, but the new tongue says provider, not remote. */
