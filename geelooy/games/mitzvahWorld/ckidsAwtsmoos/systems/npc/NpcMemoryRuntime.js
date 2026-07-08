// B"H
/**
 * NPC memory: bounded recollection where actions become trust, suspicion,
 * family consequences, prices, and greetings.
 */
import { applySocialConsequences, familyTrustSummary } from '../social/SocialConsequenceRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
const SCORE = { helped:2, help:2, donated:2, bought:1, sold:1, crafted:2, delivered:2, trained:1, promised:1, promise_kept:3, kept_promise:3, broke_promise:-4, ignored:-2, harmed:-6, gave_tzedakah:3, learned_torah:2, defended_village:4, returned_lost_object:3, apology:1 };
export function scoreMemory(event={}){ return SCORE[event.kind] ?? SCORE[event.type] ?? 0; }
export function memoryEffects(rows=[]){ const trust=rows.reduce((n,r)=>n+scoreMemory(r),0); return { trust, suspicion:Math.max(0,-trust), priceModifier:Math.max(-0.25,Math.min(0.3,-trust/100)), greetingTone:trust>=5?'warm':trust<0?'wary':'neutral', questBias:trust>3?'opens_help':'normal' }; }
export function createNpcMemoryRuntime(store=globalThis.__MITZVAH_WORLD_STATE__||{}){ const memories=store.npcMemories ||= {}; function remember(npcId='villager',event={}){ const row={...event,at:event.at||Date.now()}; memories[npcId]=[...(memories[npcId]||[]),row].slice(-32); const effects=memoryEffects(memories[npcId]); const social=applySocialConsequences(store,npcId,row,scoreMemory(row)); globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:npc-memory',{detail:{npcId,event:row,effects,social}})); return memories[npcId]; } function recall(npcId='villager',kind=null){ const rows=(memories[npcId]||[]).slice(); return kind?rows.filter(r=>r.kind===kind||r.type===kind):rows; } function disposition(npcId='villager'){ return memoryEffects(recall(npcId)).trust; } function effects(npcId='villager'){ const base=memoryEffects(recall(npcId)); return { ...base, familyTrust:familyTrustSummary(store)[npcId] || 0 }; } function knows(npcId,fact){ return recall(npcId).some(e=>e.fact===fact||e.text===fact||e.kind===fact); } return { remember, recall, disposition, effects, knows, memories }; }
export function rememberNpcEvent(npcId,event,store=globalThis.__MITZVAH_WORLD_STATE__||{}){ return createNpcMemoryRuntime(store).remember(npcId,event); }
export default createNpcMemoryRuntime;
