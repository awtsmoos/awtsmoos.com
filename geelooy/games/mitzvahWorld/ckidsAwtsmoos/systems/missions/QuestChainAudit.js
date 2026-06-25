// B"H
/**
 * QuestChainAudit
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { STARTER_MISSIONS } from './MissionRegistry.js';
export function auditQuestChains(){ const ids=new Set(); const duplicates=[]; for(const m of STARTER_MISSIONS){ if(ids.has(m.id))duplicates.push(m.id); ids.add(m.id); } return { ok:!duplicates.length && STARTER_MISSIONS.every(m=>m.chain&&m.objectives?.length), count:STARTER_MISSIONS.length, duplicates }; }
export default auditQuestChains;
