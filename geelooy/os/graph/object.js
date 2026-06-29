// B"H
import { objectId } from "./id.js";
import { validType, normalizeList } from "./types.js";
import { permission } from "./permissions.js";

export function now() {
  return new Date().toISOString();
}

export function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function graphObject(input = {}) {
  const type = validType(input.type);
  const ownerId = input.ownerId || input.userId || "current";
  return {
    id:input.id || objectId(type), type,
    title:input.title || input.name || input.id || "Object",
    url:input.url || "", path:input.path || input.url || "",
    parentId:input.parentId || "", children:normalizeList(input.children),
    refs:normalizeList(input.refs || input.references), ownerId,
    permission:input.permission || permission(ownerId),
    data:{ ...(input.data || {}) }, version:input.version || 1,
    createdAt:input.createdAt || now(), updatedAt:now()
  };
}

export function mergeObject(old, input = {}) {
  const next = { ...old, ...input, data:{ ...(old.data || {}), ...(input.data || {}) } };
  next.type = validType(next.type);
  next.children = normalizeList(next.children);
  next.refs = normalizeList(next.refs || next.references);
  next.permission ||= permission(next.ownerId || "current");
  next.version = Number(old.version || 1) + 1;
  next.updatedAt = now();
  return next;
}

export function touch(obj) {
  obj.updatedAt = now();
  return obj;
}

/**
 * B"H
 * A graph object is a chapter with a path, a parent, children, references, and
 * permission. It is small enough to hold in the hand, yet it can point toward
 * the whole palace without becoming the palace itself.
 */
