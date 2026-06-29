// B"H
import { basename, normalizePath } from "./path.js";

export function splitEntryPath(path = "/") {
  const normalized = normalizePath(path);
  const parts = normalized.split("/").filter(Boolean);
  const name = parts.pop() || "";
  return { path:normalized, parent:parts.join("/"), name };
}

export function unsupported(method, path = "") {
  return { ok:false, error:`vfs_${method}_not_implemented`, method, path };
}

export function operationResult(method, path, extra = {}) {
  return { ok:true, method, path, name:basename(path), ...extra };
}

export async function callAdapter(adapter, method, path, payload = {}) {
  if (!adapter?.[method]) return unsupported(method, path);
  return await adapter[method](path, payload);
}

/**
 * B"H
 * These are the small knives of the VFS kitchen: split the path, name the
 * operation, return the honest shape. A tiny helper prevents the registry from
 * becoming a swollen moon that pretends to be the whole sky.
 */
