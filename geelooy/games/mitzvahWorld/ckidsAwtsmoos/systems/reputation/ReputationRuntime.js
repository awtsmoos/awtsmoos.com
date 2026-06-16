// B"H
/** @file ReputationRuntime.js @description Reputation progression for solo discounts, recipes, and story trust. */
import FactionRegistry, { factionById } from "./FactionRegistry.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export const REPUTATION_STEPS = Object.freeze(["stranger", "friendly", "honored", "revered", "beloved"]);
export function ensureReputation(olam) { const p = playerOf(olam); if (!p) return null; p.reputation ||= {}; for (const f of FactionRegistry) p.reputation[f.id] ||= { id:f.id, value:0, standing:"stranger" }; return p.reputation; }
export function standingFor(value = 0) { return REPUTATION_STEPS[Math.min(REPUTATION_STEPS.length - 1, Math.floor(Math.max(0, value) / 100))]; }
export function grantReputation(olam, factionId, amount = 1, reason = "shlichus") { if (!factionById(factionId)) return false; const rep = ensureReputation(olam); const row = rep?.[factionId]; if (!row) return false; row.value += Math.max(0, Number(amount) || 0); row.standing = standingFor(row.value); olam?.ayshPeula?.("ui event", "reputation", { factionId, amount, reason, row }); return row; }
export function reputationPayload(olam) { return { factions:FactionRegistry, reputation:ensureReputation(olam) || {} }; }
export default { ensureReputation, grantReputation, reputationPayload, standingFor };
