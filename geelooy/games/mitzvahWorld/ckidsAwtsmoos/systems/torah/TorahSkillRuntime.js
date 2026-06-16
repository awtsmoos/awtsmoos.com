// B"H
/** @file TorahSkillRuntime.js @description RuneScape-like Torah skill mastery for MitzvahWorld. */
export const SkillIndex = Object.freeze({
  learning: { name: "Learning", icon: "ס" }, writing: { name: "Writing", icon: "כ" }, niggun: { name: "Niggun", icon: "נ" }, hitbonenus: { name: "Hitbonenus", icon: "ט" }, chochmah: { name: "Chochmah", icon: "ח" }, binah: { name: "Binah", icon: "ב" }, daat: { name: "Daat", icon: "ד" }
});
const ids = Object.keys(SkillIndex);
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function next(level) { return Math.floor(24 + Math.max(1, level) ** 1.45 * 18); }
export function ensureTorahSkills(olam) { const p = playerOf(olam); if (!p) return null; p.torahSkills ||= {}; for (const id of ids) p.torahSkills[id] ||= { id, level: 1, xp: 0, xpToNext: next(1) }; emitTorahSkills(olam); return p.torahSkills; }
export function grantTorahSkillXp(olam, id, amount = 1, reason = "Torah") { const skills = ensureTorahSkills(olam); const s = skills?.[id]; if (!s) return null; s.xp += Math.max(1, Math.floor(amount)); let leveled = 0; while (s.xp >= s.xpToNext) { s.xp -= s.xpToNext; s.level += 1; s.xpToNext = next(s.level); leveled++; } if (leveled) olam?.ayshPeula?.("ui event", "effectsOverlay", { text: `${SkillIndex[id].name} LEVEL ${s.level}`, color: "#d7c8ff" }); emitTorahSkills(olam); return { ...s, leveled, reason }; }
export function grantPassageUseSkills(olam, passage = {}) { const cat = passage.category || "Mishnah"; grantTorahSkillXp(olam, "learning", 5, passage.name); if (cat === "Niggun") grantTorahSkillXp(olam, "niggun", 7, passage.name); if (cat === "Chassidus") grantTorahSkillXp(olam, "daat", 6, passage.name); if (cat === "Kabbalah") grantTorahSkillXp(olam, "chochmah", 7, passage.name); if (cat === "Mishnah") grantTorahSkillXp(olam, "binah", 5, passage.name); }
export function torahSkillsPayload(olam) { const skills = ensureTorahSkills(olam) || {}; return Object.values(skills).map(s => ({ ...s, name: SkillIndex[s.id]?.name, icon: SkillIndex[s.id]?.icon })); }
export function emitTorahSkills(olam) { const p = playerOf(olam); if (!p?.torahSkills) return false; const updateSkills = Object.values(p.torahSkills).map(s => ({ ...s, name: SkillIndex[s.id]?.name, icon: SkillIndex[s.id]?.icon })); olam?.ayshPeula?.("ui event", "torahSkills", { updateSkills }); return updateSkills; }
export default { ensureTorahSkills, grantTorahSkillXp, grantPassageUseSkills, torahSkillsPayload, emitTorahSkills };
