// B"H
/** @file BossEncounterRuntime.js @description Soloable boss phases, warnings, and encounter payloads. */
export const BossRegistry = Object.freeze({ guardian_hidden_sparks:{ id:"guardian_hidden_sparks", title:"Guardian of Hidden Sparks", level:18, elite:true, phases:[75,50,25], hint:"Solo boss: repair, rest, use ranked Torah." } });
export function bossPayload(id = "guardian_hidden_sparks") { return BossRegistry[id] || null; }
export function bossPhaseFor(boss, hp, maxHp) { const pct = Math.max(0, Math.min(100, Math.ceil(Number(hp || 0) / Math.max(1, Number(maxHp || 1)) * 100))); const phases = boss?.phases || []; return phases.find(p => pct <= p) || null; }
export function encounterUpdate(olam, id, hp, maxHp) { const boss = bossPayload(id); if (!boss) return false; const phase = bossPhaseFor(boss, hp, maxHp); const payload = { boss, hp, maxHp, phase }; olam?.ayshPeula?.("ui event", "bossEncounter", payload); return payload; }
export default { BossRegistry, bossPayload, bossPhaseFor, encounterUpdate };
