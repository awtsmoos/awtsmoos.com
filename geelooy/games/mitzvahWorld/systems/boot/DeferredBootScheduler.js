// B"H
/**
 * DeferredBootScheduler: stage one loads only FPS-critical proof spines.
 * Heavy realism waits; cheap memory may sing, but rendering never pays early.
 */
const scope=globalThis;
const state=scope.__MITZVAH_DEFERRED_BOOT__||={seal:'fps-core-guardian-20260623-bh3',startedAt:Date.now(),loaded:[],failed:[]};
const coreQueue=Object.freeze([
  ['fps-guardian','../performance/FpsGuardian.js?v=fps-guardian-default-core-20260623-bh3',120],
  ['unified-dream-spine','../dream/UnifiedMitzvahWorldDreamBootstrap.js?v=one-world-dream-20260623-bh2',260],
  ['animal-proof','../dream/AnimalProofBootstrap.js?v=wildlife-proof-scanner-20260623-bh1',950]
]);
const extrasQueue=Object.freeze([
  ['ancient-scroll-ui','../ui/AncientScrollUiPolish.js?v=step-by-step-20260621-bh1',3500],
  ['realism-fast-fps','../realism/RealismFastFpsBootstrap.js?v=master-realism-fast-fps-20260622-bh1',9000],
  ['world-memory','../worldMemory/WorldMemoryBootstrap.js?v=full-hyperrealism-step-1-20260622-bh1',16000],
  ['story','../story/StoryBootstrap.js?v=texture-pingpong-story-20260622-bh1',24000],
  ['living-world','../realism/LivingWorldBootstrap.js?v=living-world-hyperrealism-20260622-bh1',42000]
]);
function extrasEnabled(){try{return new URLSearchParams(scope.location?.search||'').get('dreamExtras')==='true';}catch{return false;}}
function emit(name,detail){try{scope.dispatchEvent?.(new CustomEvent(name,{detail}));}catch{}}
function mark(kind,name,extra={}){const row={name,at:Date.now(),...extra};state[kind].push(row);emit(`mitzvah-world:deferred-boot-${kind}`,row);}
function idle(fn,timeout=1800){return scope.requestIdleCallback?scope.requestIdleCallback(fn,{timeout}):scope.setTimeout(fn,Math.min(timeout,700));}
async function loadOne([name,spec]){try{await import(spec);mark('loaded',name,{spec});}catch(error){console.warn("B'H deferred boot failed",name,error);mark('failed',name,{spec,error:String(error?.message||error)});}}
function schedule(task){scope.setTimeout(()=>idle(()=>loadOne(task),2200),task[2]||0);}
function start(){if(state.scheduled)return state;state.scheduled=true;state.fpsFirst=true;state.guardianDefault=true;state.extrasEnabled=extrasEnabled();const queue=state.extrasEnabled?[...coreQueue,...extrasQueue]:[...coreQueue];state.queue=queue.map(([name])=>name);queue.forEach(schedule);return state;}
if(scope.document?.readyState==='loading')scope.addEventListener?.('DOMContentLoaded',start,{once:true});else start();
export{coreQueue,extrasQueue,start};
export default state;
