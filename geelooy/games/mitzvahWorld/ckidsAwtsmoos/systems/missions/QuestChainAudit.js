// B"H
/** @file QuestChainAudit.js @description Audits mission chains and breadcrumb bridges. */
import MissionRegistry from "./MissionRegistry.js";
import { BreadcrumbRegistry } from "./BreadcrumbRuntime.js";
export function runQuestChainAudit() { const ids = new Set(MissionRegistry.map(m => m.id)); const brokenNext = MissionRegistry.flatMap(m => (m.nextMissions || []).filter(id => !ids.has(id)).map(id => `${m.id}->${id}`)); const brokenBread = BreadcrumbRegistry.filter(b => !ids.has(b.from)); return { ok:brokenNext.length === 0 && brokenBread.length === 0 && MissionRegistry.length >= 20, missions:MissionRegistry.length, brokenNext, brokenBread:brokenBread.map(b => b.from) }; }
export default { runQuestChainAudit };
