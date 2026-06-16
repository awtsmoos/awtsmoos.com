// B"H
/**
 * @file CreatureLevelRuntime.js
 * @description
 * Chapter 622: The Awtsmoos reveals that some bodies in the scene are only
 * mirrors with getter-only doors. We do not break the door. We place the
 * creature soul-state in userData and health adapters, so combat may know
 * level, HP, armor, dodge, reward, and danger without trying to write into a
 * sealed mesh property.
 */
export const ZONE_LEVELS = Object.freeze({
  villageCenter: { label:"Village Center", min:1, max:1, radius:34 },
  villageEdge: { label:"Village Edge", min:1, max:2, radius:70 },
  forestEdge: { label:"Forest Edge", min:2, max:4, radius:130 },
  deepForest: { label:"Deep Forest", min:5, max:8, radius:210 },
  mountainPath: { label:"Mountain Path", min:8, max:12, radius:300 },
  hiddenCave: { label:"Hidden Cave", min:12, max:18, radius:420 },
  ancientRuins: { label:"Ancient Ruins", min:18, max:25, radius:Infinity }
});
const SPECIES = Object.freeze({ fox:1, wolf:3, deer:0, goat:1, bird:0, frog:0, rabbit:0, target:0 });
const COLORS = Object.freeze({ gray:"#9ba0a8", green:"#59d66f", yellow:"#ffe36e", orange:"#ff9a38", red:"#ff4b43", skull:"#d6ccff" });
function objectData(target) { const mesh = target?.mesh || target; if (mesh && !mesh.userData) mesh.userData = {}; return mesh?.userData || {}; }
function speciesOf(target) { const d = objectData(target); return target?.def?.species || d.species || d.motion?.species || d.profile?.species || "target"; }
function positionOf(target) { return target?.mesh?.position || target?.position || null; }
function distOf(target) { const p = positionOf(target); return p ? Math.hypot(p.x || 0, p.z || 0) : 0; }
function numeric(v, fallback = 0) { const n = Number(v); return Number.isFinite(n) ? n : fallback; }
function writeIfPossible(obj, key, value) { try { const own = Object.getOwnPropertyDescriptor(obj, key); const proto = Object.getPrototypeOf(obj); const inherited = proto ? Object.getOwnPropertyDescriptor(proto, key) : null; const desc = own || inherited; if (!desc || desc.writable || desc.set) { obj[key] = value; return true; } } catch {} return false; }
function healthAdapter(target) {
  const d = objectData(target);
  if (target?.health) return target.health;
  if (d.health) return d.health;
  d.combatHp = numeric(d.combatHp, numeric(target?.hp, 0));
  d.combatMaxHp = Math.max(1, numeric(d.combatMaxHp, numeric(target?.maxHp, 1)));
  d.health = {
    get current() { return numeric(d.combatHp, 0); },
    set current(v) { d.combatHp = Math.max(0, numeric(v, 0)); },
    get max() { return Math.max(1, numeric(d.combatMaxHp, 1)); },
    set max(v) { d.combatMaxHp = Math.max(1, numeric(v, 1)); }
  };
  return d.health;
}
export function zoneForPosition(position) {
  const d = position ? Math.hypot(position.x || 0, position.z || 0) : 0;
  return Object.entries(ZONE_LEVELS).find(([, z]) => d <= z.radius)?.[1] || ZONE_LEVELS.ancientRuins;
}
export function difficultyColor(playerLevel = 1, creatureLevel = 1) {
  const delta = creatureLevel - playerLevel;
  if (delta <= -5) return "gray";
  if (delta <= -2) return "green";
  if (delta <= 1) return "yellow";
  if (delta <= 3) return "orange";
  if (delta <= 6) return "red";
  return "skull";
}
export function scaleCreatureStats(level, species = "target") {
  const wild = Math.max(1, Number(level) || 1), bonus = SPECIES[species] || 0;
  return { level:wild, maxHealth:Math.floor(70 + wild * 42 + bonus * 18), damage:Math.floor(6 + wild * 3.8 + bonus * 2), armor:Math.floor(wild * 1.7 + bonus), dodge:Math.min(0.28, 0.025 + wild * 0.006 + bonus * 0.008), xpReward:Math.floor(24 + wild * 14 + bonus * 8) };
}
export function ensureCreatureLevel(target, playerLevel = 1) {
  if (!target?.mesh && !target?.isObject3D) return null;
  const data = objectData(target), mesh = target.mesh || target;
  if (data.creatureLevelStats) return data.creatureLevelStats;
  const zone = zoneForPosition(mesh.position || positionOf(target));
  const base = zone.min + Math.floor(Math.min(zone.max - zone.min, distOf(target) / Math.max(1, zone.radius || 1) * 2));
  const level = Math.max(1, Math.min(zone.max, base + (SPECIES[speciesOf(target)] || 0)));
  const stats = scaleCreatureStats(level, speciesOf(target));
  stats.zone = zone.label;
  stats.difficulty = difficultyColor(playerLevel, level);
  stats.difficultyColor = COLORS[stats.difficulty];
  const h = healthAdapter(target);
  h.max = Math.max(numeric(h.max, 1), stats.maxHealth);
  if (!Number.isFinite(numeric(h.current, NaN)) || numeric(h.current, 0) <= 0) h.current = h.max;
  writeIfPossible(target, "maxHp", h.max);
  writeIfPossible(target, "hp", h.current);
  data.creatureLevelStats = stats;
  data.combatMaxHp = h.max;
  data.combatHp = h.current;
  return stats;
}
export function creaturePayload(target, playerLevel = 1) {
  const s = ensureCreatureLevel(target, playerLevel) || {}, h = healthAdapter(target);
  const difficulty = difficultyColor(playerLevel, s.level || 1);
  return { ...s, difficulty, difficultyColor:COLORS[difficulty], name:target?.name || target?.mesh?.name, species:speciesOf(target), hp:numeric(h.current, 0), maxHp:numeric(h.max, s.maxHealth || 1) };
}
export default { ensureCreatureLevel, creaturePayload, difficultyColor, scaleCreatureStats, zoneForPosition };
