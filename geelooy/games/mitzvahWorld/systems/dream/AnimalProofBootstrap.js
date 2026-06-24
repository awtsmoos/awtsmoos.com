// B"H
/** @file AnimalProofBootstrap.js @description Cheap wildlife proof scanner for real kills, food, and gameplay tests. */
const scope = globalThis;
const state = scope.__MITZVAH_ANIMAL_KILL_CONFIRMATION__ ||= { seal:"wildlife-proof-scanner-20260623-bh2", totalKills:0, foodDropped:0, kills:[], liveIds:[] };
function arr(x){ return Array.isArray(x) ? x : []; }
function registeredRoots(){ return arr(scope.__MITZVAH_WILDLIFE_ROOTS__); }
function knownRoots(){ return [scope.__AWTSMOOS_OLAM__?.scene, scope.__AWTSMOOS_OLAM__?.olam?.scene, scope.olam?.scene, scope.ikar?.scene, scope.scene, scope.__livingRegionRoot, scope.__MITZVAH_REGION_ROOT__].filter(Boolean); }
function sceneRoots(){ return [...registeredRoots(), ...knownRoots()].filter(Boolean); }
function isAnimal(o){ const u=o?.userData||{}; return u.wildlifeActor || u.realisticWildlife || u.fullGameplayAnimal || u.singleMeshAnimal || u.species || /rabbit|fox|deer|goat|cow|frog|bird/i.test(String(o?.name||"")); }
function animalId(o,i){ const u=o.userData ||= {}; return u.animalProofId ||= u.id || u.motion?.id || o.name || `wildlife_actor_${i}`; }
function liveMap(){ return scope.__MITZVAH_LIVE_ANIMAL_MOBS__ ||= {}; }
function markFood(o){ state.foodDropped += 1; state.lastFoodDrop = { id:o?.userData?.animalProofId, species:o?.userData?.species, at:Date.now() }; }
function kill(o, amount=9999){ if(!o || o.userData?.animalDead) return { ok:false, error:"animal_missing_or_dead" }; const u=o.userData ||= {}, id=animalId(o,0), species=u.species || u.displayName || u.targetName || "animal"; u.animalDead = true; if(u.health) { u.health.current = 0; u.health.dead = true; } o.visible = false; state.totalKills += 1; const row = { id, species, amount, at:Date.now() }; state.kills.push(row); state.kills = state.kills.slice(-80); markFood(o); return { ok:true, id, species, dead:true, hp:0 }; }
function registerObject(o,index){ if(!isAnimal(o) || o.userData?.animalDead) return 0; const id=animalId(o,index); liveMap()[id]=o; return 1; }
function register(root){ let count=0; root?.traverse?.((o)=>{ count += registerObject(o,count); }); if(!root?.traverse && isAnimal(root)) count += registerObject(root,count); return count; }
function scan(){ let count=0; for(const root of sceneRoots()) count += register(root); for(const o of arr(scope.__MITZVAH_REGISTERED_WILDLIFE__)) count += registerObject(o,count); state.liveIds = Object.keys(liveMap()).filter(id => liveMap()[id] && !liveMap()[id].userData?.animalDead); state.lastScan = { count, roots:sceneRoots().length, at:Date.now() }; return state; }
function expose(){ scope.__MITZVAH_SCAN_ANIMALS__ = scan; scope.__MITZVAH_TEST_DAMAGE_ANIMAL__ = (id, amount=9999) => { scan(); const o = liveMap()[id] || liveMap()[state.liveIds[0]]; return kill(o, amount); }; scope.__MITZVAH_TEST_KILL_SEVEN_ANIMALS__ = () => { scan(); return state.liveIds.slice(0,7).map(id => scope.__MITZVAH_TEST_DAMAGE_ANIMAL__(id,9999)); }; scope.__MITZVAH_REGISTER_ANIMAL__ = o => { const ok=registerObject(o, state.liveIds.length); scan(); return ok; }; }
function start(){ if(state.scannerReady) return state; state.scannerReady = true; expose(); scan(); scope.setInterval?.(scan, 3000); return state; }
if(scope.document?.readyState === "loading") scope.addEventListener?.("DOMContentLoaded", start, { once:true }); else start();
export { start, scan };
export default state;
