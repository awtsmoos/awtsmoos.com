// B"H
import { GRAPH_RIGHTS, normalizeList } from "./types.js";

export function permission(owner = "current", roles = {}) {
  const prepared = {};
  for (const right of GRAPH_RIGHTS) prepared[right] = [owner];
  for (const [right, users] of Object.entries(roles || {})) {
    prepared[right] = [...new Set([...normalizeList(prepared[right]), ...normalizeList(users)])];
  }
  return { owner, roles:prepared, expiresAt:null };
}

export function can(obj, user = "current", right = "read") {
  if (!obj?.permission) return right === "read";
  const list = obj.permission.roles?.[right] || [];
  return obj.permission.owner === user || list.includes(user) || list.includes("*");
}

export function grant(obj, right, user) {
  obj.permission ||= permission();
  obj.permission.roles[right] ||= [];
  if (!obj.permission.roles[right].includes(user)) obj.permission.roles[right].push(user);
  return obj;
}

/**
 * B"H
 * Permission is the gatekeeper at the river. The object may shine, but only the
 * named soul may steer it, delete it, watch it, or share its light beyond the
 * walls of the browser kingdom.
 */
