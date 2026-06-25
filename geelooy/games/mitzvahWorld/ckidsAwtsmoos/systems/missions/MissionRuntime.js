// B"H
/**
 * MissionRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

import { getMission } from './MissionRegistry.js';
export function createMissionRuntime(store={}){ const active=store.activeMissions||={}; const complete=store.completedMissions||=[]; return { accept(id){const m=getMission(id); if(m&&!active[id]&&!complete.includes(id))active[id]={...m,progress:0}; return active[id]||null;}, progress(id,n=1){if(!active[id])return null; active[id].progress+=n; return active[id];}, finish(id){const m=active[id]; if(!m)return null; delete active[id]; if(!complete.includes(id))complete.push(id); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:mission-complete',{detail:m})); return m;}, state(){return {active,complete};} }; }
export default createMissionRuntime;
