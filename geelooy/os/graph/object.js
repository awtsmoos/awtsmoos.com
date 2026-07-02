// B"H
import { objectId } from "./id.js";
import { validType, normalizeList } from "./types.js";
import { permission } from "./permissions.js";
import { makeAwtsmoosUrl } from "./urls.js";
import { providerCapabilities } from "../providers/capabilities.js";

export function now() { return new Date().toISOString(); }
export function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }

export function graphObject(input = {}) {
  const type = validType(input.type);
  const ownerId = input.ownerId || input.userId || "current";
  const provider = input.provider || input.providerKind || input.kind || "virtual";
  const id = input.id || objectId(type);
  const path = input.path || input.url || "";
  const url = input.url || makeAwtsmoosUrl(provider, path || id);
  const capabilities = providerCapabilities({ ...input, provider });
  return {
    id, type, provider, providerId:input.providerId || provider,
    title:input.title || input.name || id || "Object", url, path,
    parentId:input.parentId || "", children:normalizeList(input.children),
    refs:normalizeList(input.refs || input.references), ownerId,
    permission:input.permission || permission(ownerId), capabilities,
    actions:normalizeList(input.actions || capabilities), metadata:{ ...(input.metadata || {}) },
    data:{ ...(input.data || {}) }, version:input.version || 1,
    createdAt:input.createdAt || now(), updatedAt:now()
  };
}

export function mergeObject(old, input = {}) {
  const next = { ...old, ...input, data:{ ...(old.data || {}), ...(input.data || {}) }, metadata:{ ...(old.metadata || {}), ...(input.metadata || {}) } };
  next.type = validType(next.type); next.children = normalizeList(next.children); next.refs = normalizeList(next.refs || next.references);
  next.provider = next.provider || next.kind || "virtual"; next.providerId ||= next.provider;
  next.capabilities = providerCapabilities(next); next.actions = normalizeList(next.actions || next.capabilities);
  next.permission ||= permission(next.ownerId || "current"); next.version = Number(old.version || 1) + 1; next.updatedAt = now();
  return next;
}

export function touch(obj) { obj.updatedAt = now(); return obj; }

/** B"H: the object is one; provider, action, and history are only its garments. */
