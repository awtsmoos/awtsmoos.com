// B"H
/**
 * @file SocialConsequenceRuntime.js
 * @description
 * In a living shtetl, kindness to a mother reaches a child, and harm can be
 * repaired only by truth. The Awtsmoos lets each consequence stay bounded:
 * family trust, social rows, and apologies, never a frame-loop storm.
 */
const FAMILY_FACTOR = 0.5;
const LIMIT = 60;
const cap = (xs,n=LIMIT)=>(xs||[]).slice(-n);
function npcs(store={}){ return store.npcs || []; }
function npcById(store,id){ return npcs(store).find(n=>n.id===id||n.npcId===id) || null; }
function familyOf(store,npcId){ const npc=npcById(store,npcId); return [...new Set([...(npc?.family||[]), ...npcs(store).filter(n=>(n.family||[]).includes(npcId)).map(n=>n.id)])]; }
function ensure(store){ store.familyTrust ||= {}; store.socialConsequences ||= []; store.apologies ||= []; return store; }
function addTrust(store,npcId,amount){ store.familyTrust[npcId]=(store.familyTrust[npcId]||0)+amount; return store.familyTrust[npcId]; }
export function applySocialConsequences(store={}, npcId='villager', event={}, score=0){ ensure(store); if(!score) return { affected:[], consequence:null }; const affected=familyOf(store,npcId); const rows=[]; for(const familyId of affected){ const amount=Math.round(score*FAMILY_FACTOR*10)/10; addTrust(store,familyId,amount); rows.push({ npcId:familyId, sourceNpc:npcId, amount, kind:event.kind||event.type||'memory', text:event.text||'', at:Date.now() }); } if(rows.length) store.socialConsequences=cap([...(store.socialConsequences||[]),...rows]); return { affected, consequence:rows.at(-1)||null, rows, familyTrust:familyTrustSummary(store) }; }
export function applyApology(store={}, npcId='villager', options={}){ ensure(store); const family=familyOf(store,npcId); const repair=Number(options.repair ?? 1); const rows=[npcId,...family].map(id=>{ addTrust(store,id,repair); return { npcId:id, sourceNpc:npcId, repair, text:options.text||'The player apologized sincerely.', at:Date.now() }; }); store.apologies=cap([...(store.apologies||[]),...rows],40); store.socialConsequences=cap([...(store.socialConsequences||[]),...rows.map(r=>({...r,kind:'apology'}))]); return { repaired:rows.map(r=>r.npcId), familyTrust:familyTrustSummary(store) }; }
export function familyTrustSummary(store={}){ ensure(store); return { ...(store.familyTrust||{}) }; }
export function createSocialConsequenceRuntime(store={}){ ensure(store); return { apply:(npcId,event,score)=>applySocialConsequences(store,npcId,event,score), apologize:(npcId,options)=>applyApology(store,npcId,options), summary:()=>familyTrustSummary(store), rows:()=>cap(store.socialConsequences||[]) }; }
export default { applySocialConsequences, applyApology, familyTrustSummary, createSocialConsequenceRuntime };
