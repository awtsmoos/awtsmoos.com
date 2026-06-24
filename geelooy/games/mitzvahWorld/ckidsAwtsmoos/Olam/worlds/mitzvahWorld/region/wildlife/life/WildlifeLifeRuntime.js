// B"H
/** @file WildlifeLifeRuntime.js @description Tiered wildlife life conductor: near acts, far remembers statistically. */
import { dataOf } from './LifeMath.js';
import { thinkWildlife, brainSummary } from './WildlifeBrain.js';
import { buildHerds, herdSummary } from './HerdManager.js';
import { buildFlocks, flockSummary } from './BirdFlockManager.js';
import { seedWaterPoints } from './WaterLifeSystem.js';
function actorsOf(root){ return root?.children?.filter(c=>dataOf(c).wildlifeActor) || []; }
function dist(a,b){ const p=a.position||{}, q=b||{x:0,z:0}; return Math.hypot((p.x||0)-(q.x||0),(p.z||0)-(q.z||0)); }
function tier(actor, player){ const d=dist(actor,player); return d<32?"near":d<90?"mid":d<190?"far":"statistical"; }
function shouldTick(actor, tick, player){ const t=tier(actor,player); dataOf(actor).lodTier=t; return t==='near' || (t==='mid' && tick%8===0) || (t==='far' && tick%30===0); }
function summary(store, actors, groups){ return Object.assign({ livingEcosystem:true, tieredRuntime:true, actors:actors.length, ticks:store.ticks }, brainSummary(actors), herdSummary(groups.herds), flockSummary(groups.flocks)); }
export function createWildlifeLifeRuntime(root, olam, report = {}) { const store={ ticks:0, acc:0, report, waterPoints:seedWaterPoints(), summary:null }; const runtime={ store, tick(dt=1/60){ store.acc += dt; if(store.acc < .25) return store.summary; store.acc=0; store.ticks++; const actors=actorsOf(root), player=(olam?.player||olam?.chossid)?.mesh?.position || {x:0,z:0}; const active=actors.filter(a=>shouldTick(a,store.ticks,player)); const groups={ herds:buildHerds(active), flocks:buildFlocks(active) }; const world={ dayTime:((Date.now()%240000)/240000), water:store.waterPoints, food:[] }; active.forEach((actor,i)=>{ const d=dataOf(actor); if(d.health?.dead) return; const decision=thinkWildlife(actor,active,world,groups,dt,(d.motion?.seed||i)+store.ticks); d.lifeDecision=decision; if(decision?.state) d.state=decision.state; }); store.summary=summary(store,actors,groups); store.summary.activeActors=active.length; root.userData.lifeSummary=store.summary; if(olam) olam.__AWTSMOOS_WILDLIFE_LIFE__=store.summary; return store.summary; } }; root.userData.lifeRuntime=runtime; return runtime; }
export default createWildlifeLifeRuntime;
