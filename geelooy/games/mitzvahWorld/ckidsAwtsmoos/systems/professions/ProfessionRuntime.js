// B"H
/** @file ProfessionRuntime.js @description Profession XP and rank state for one-player completion. */
import ProfessionRegistry, { professionById } from "./ProfessionRegistry.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function next(rank) { return 50 + Math.max(1, rank) * 35; }
export function ensureProfessions(olam) { const p = playerOf(olam); if (!p) return null; p.professions ||= {}; for (const def of ProfessionRegistry) p.professions[def.id] ||= { id:def.id, rank:1, xp:0, xpToNext:next(1) }; return p.professions; }
export function grantProfessionXp(olam, id, amount = 1) { if (!professionById(id)) return false; const row = ensureProfessions(olam)?.[id]; if (!row) return false; row.xp += Math.max(0, Math.floor(Number(amount) || 0)); while (row.xp >= row.xpToNext) { row.xp -= row.xpToNext; row.rank++; row.xpToNext = next(row.rank); } olam?.ayshPeula?.("ui event", "profession", row); return row; }
export function professionsPayload(olam) { return { professions:ProfessionRegistry, state:ensureProfessions(olam) || {} }; }
export default { ensureProfessions, grantProfessionXp, professionsPayload };
