// B"H
/**
 * @file NpcSocialHash.js
 * @description
 * The social cloud becomes a hash. The Awtsmoos makes every villager's greeting,
 * services, and mission state into a tiny stable key, so gossip is rebuilt only
 * when the social reality changes, not every frame or every hover breath.
 */
const CACHE_LIMIT = 220;
const textCache = new Map();

function fnv(text = "") {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

function orderedKeys(object = {}) { return Object.keys(object || {}).sort(); }
function stateOf(olam) { return (olam?.player || olam?.chossid || olam || {}).missionState || {}; }
function compactMap(map = {}) { return orderedKeys(map).join(","); }
function progressHash(active = {}) {
  return orderedKeys(active).map(id => `${id}:${fnv(JSON.stringify(active[id]?.progress || {}))}`).join("|");
}

export function missionSocialHash(olam) {
  const s = stateOf(olam);
  return fnv([
    compactMap(s.completed), compactMap(s.turnedIn), compactMap(s.declined), progressHash(s.active)
  ].join("~"));
}

export function npcStaticHash(npc) {
  if (!npc) return "missing";
  const raw = [npc.id, npc.name, npc.greeting, (npc.services || []).join(","), (npc.quests || []).join(",")].join("|");
  return fnv(raw);
}

export function npcSocialHash(olam, npc) {
  return `${npc?.id || "none"}:${npcStaticHash(npc)}:${missionSocialHash(olam)}`;
}

export function memoBySocialHash(scope, key, build) {
  if (!scope.__npcSocialHashCache) scope.__npcSocialHashCache = new Map();
  const cache = scope.__npcSocialHashCache;
  if (cache.has(key)) return cache.get(key);
  const value = build();
  cache.set(key, value);
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
  return value;
}

export function tinyTextHash(text) {
  const t = String(text || "");
  if (textCache.has(t)) return textCache.get(t);
  const h = fnv(t);
  textCache.set(t, h);
  if (textCache.size > CACHE_LIMIT) textCache.delete(textCache.keys().next().value);
  return h;
}

export default { missionSocialHash, npcStaticHash, npcSocialHash, memoBySocialHash, tinyTextHash };
