// B"H
/**
 * @file RegionWildlifeRenderer.js
 * @description
 * Wildlife runtime with single-mesh generated animals. No separate tap proxy,
 * no extra health-bar children, no readability-core pile. Every generated
 * creature is one mesh vessel carrying combat, targeting, motion, and animation
 * in userData while the Awtsmoos keeps the frame uncluttered.
 */
import { ensureRenderBackend } from "../../../../../rendering/RendererProvider.js";
import { groundY } from "./RegionGround.js";
import { rand } from "./RegionRandom.js";
import { sealRegionVisual } from "./RegionSeal.js";
import { buildAnimal } from "../wildlife/render/AnimalBodyForge.js?v=single-mesh-animals-20260621-bh1";
import { animateAnimal } from "../wildlife/render/AnimalAnimator.js?v=animal-lod-wire-20260622-bh1";
import { createWildlifeLifeRuntime } from "../wildlife/life/WildlifeLifeRuntime.js?v=single-mesh-animals-20260621-bh1";
import { decisionFromWildlifeCombat, ensureWildlifeCombat } from "../../../../../systems/creatures/WildlifeCombatAdapter.js";
import { getDynamicActorPartition } from "../../runtime/DynamicActorPartition.js?v=awtsmoos-budgeted-20260621-bh1";

const COUNTS = Object.freeze({ rabbit:18, fox:6, deer:8, goat:6, cow:5, frog:12, bird:10 });
const FLAGS = Object.freeze({ wildlifeActor:true, realisticWildlife:true, selectableCombatTarget:true, skipRaycast:false, interactionLayer:"explicit-interaction", singleMeshAnimal:true });
const FAST = new Set(["hunt", "attack", "flee", "fleePlayer", "flock", "swoop", "panic", "pounce", "run", "return_home"]);
const SIZE = Object.freeze({ frog:[2.1,1.35,2.1], bird:[2.6,2.35,2.6], cow:[2.8,2.2,3.2], deer:[2.2,2.15,2.5], goat:[1.8,1.75,1.9], fox:[1.9,1.55,2.0], rabbit:[1.65,1.35,1.65] });
const TINT = Object.freeze({ fox:0xb65a28, rabbit:0xbba995, deer:0xa56b3a, goat:0xd4c7aa, cow:0x7b5a42, frog:0x4e9b45, bird:0x5f7fb2 });

function d2(a,b){ const dx=a.x-b.x,dz=a.z-b.z; return dx*dx+dz*dz; }
function len(x,z){ return Math.sqrt(x*x+z*z); }
function reportAnimals(report){ const w=report?.wildlife; return w&&Array.isArray(w.animals)&&w.animals.length?w.animals:null; }
function fallbackAnimals(){ const out=[]; for(const s of Object.keys(COUNTS)) for(let i=0;i<COUNTS[s];i++) out.push({ id:`${s}_${i}`, species:s, x:(rand(i,1)-.5)*320+(s==="cow"?24:0), z:(rand(i,2)-.5)*160+(s==="cow"?18:0), state:"wander", needs:{} }); return out; }
function wildlifeCap(){ return 84; }
function animalsFromReport(report){ return (reportAnimals(report)||fallbackAnimals()).slice(0,wildlifeCap()); }
function playerMesh(olam){ const p=olam&&(olam.player||olam.chossid); return p?.mesh||null; }
function boxData(s=[1,1,1]){ const x=s[0]/2,y=s[1]/2,z=s[2]/2; return { positions:[-x,-y,-z,x,-y,-z,x,y,-z,-x,y,-z,-x,-y,z,x,-y,z,x,y,z,-x,y,z], indices:[0,1,2,0,2,3,4,6,5,4,7,6,0,4,5,0,5,1,1,5,6,1,6,2,2,6,7,2,7,3,3,7,4,3,4,0] }; }
function clearSpawn(olam,x,z,i){ const live=playerMesh(olam),sx=live?live.position.x:-10.8,sz=live?live.position.z:16.2,dx=x-sx,dz=z-sz; if(dx*dx+dz*dz>=576) return {x,z}; const a=dx*dx+dz*dz>.01?Math.atan2(dz,dx):rand(i,73)*Math.PI*2; return { x:sx+Math.cos(a)*(27+rand(i,74)*9), z:sz+Math.sin(a)*(27+rand(i,74)*9) }; }
function safe(v){ return Number.isFinite(Number(v))?Number(v):0; }
function radius(a){ return a.territory?.radius?Math.min(42,a.territory.radius):a.species==="cow"?18:24; }
function speed(a,root){ return a.traits?.speed||root.userData.profile?.speed||.8; }
function countMeshes(root){ let count=0; root?.traverse?.(c=>{ if(c.isMesh||c.isSkinnedMesh) count++; }); return count; }

function fastAnimal(species,animal,backend){
  const size=SIZE[species]||[1.5,1.4,1.5];
  const mesh=backend.mesh({ geometry:backend.geometry(boxData([size[0]*.72,size[1]*.52,size[2]*.82])), material:backend.material({ kind:"lambert", color:TINT[species]||0x9c8a67, roughness:.9, name:`single_mesh_fast_${species}_body` }), name:`single_mesh_fast_${species}_${animal.id||"wild"}` });
  mesh.position.y=size[1]*.32;
  Object.assign(mesh.userData,{ species, displayName:species, targetName:species, profile:{ speed:.85, groundLift:species==="frog"?.18:.035 }, fastWildlifeProxy:true, health:{ current:120, max:120, dead:false, hitsTaken:0 }, faction:species==="fox"?"hostile":"neutral", selectableCombatTarget:true, wildlifeActor:true, singleMeshAnimal:true, renderMeshCount:1, audit:{ singleMeshVerified:true, meshes:1, drawCalls:1 } });
  mesh.takeDamage=amount=>{ const h=mesh.userData.health; h.current=Math.max(0,Number(h.current||0)-Math.max(1,Number(amount)||1)); h.dead=h.current<=0; if(h.dead) mesh.visible=false; return amount; };
  return mesh;
}
function makeVisibleAnimal(species,animal,backend,index=0){ return (species==="fox"||index<10||globalThis.__AWTSMOOS_DETAILED_WILDLIFE__===true) ? buildAnimal(species,animal) : fastAnimal(species,animal,backend); }
function restoreFlags(root){ Object.assign(root.userData,FLAGS,{ renderMeshCount:countMeshes(root), singleMeshVerified:countMeshes(root)===1 }); root.nivraAwtsmoos=root; }
function makeActor(animal,i,olam,backend){ const species=animal.species||"rabbit", root=makeVisibleAnimal(species,animal,backend,i), p=clearSpawn(olam,safe(animal.x),safe(animal.z),i), lift=root.userData?.profile?.groundLift||(species==="frog"?.18:.035); root.position.set(p.x,groundY(olam,p.x,p.z)+lift,p.z); root.userData.motion={ id:animal.id, species, homeX:p.x, homeZ:p.z, phase:rand(i,3)*6.28, seed:i*17+species.length, radius:radius(animal), speed:speed(animal,root), vx:0, vz:0, destX:p.x, destZ:p.z, waypoint:0, wait:rand(i,9)*2, attackCooldown:0, animTime:0, wingBeat:species==="bird"?5+rand(i,41)*2:0, altitude:species==="bird"?4.5+rand(i,42)*3.8:0, groundLift:lift }; root.userData.fullGameplayAnimal = true; root.userData.detailedNearAnimal = i < 8 || species === "fox"; restoreFlags(root); ensureWildlifeCombat(root,olam); sealRegionVisual(root,FLAGS); restoreFlags(root); return root; }
function nearest(root,species,from){ let best=null,distance=Infinity; for(const child of root.children){ const m=child.userData?.motion; if(!m||m.species!==species) continue; const next=Math.sqrt(d2(child.position,from.position)); if(next<distance){best=child;distance=next;} } return {best,distance}; }
function oldChoose(root,animal,motion,olam){ const pm=playerMesh(olam),pp=pm?.position,pd=pp?Math.sqrt(d2(animal.position,pp)):Infinity; if(motion.species==="bird") return pp&&pd<10?{state:"swoop",target:pp,player:false}:{state:"flock"}; if(motion.species==="fox"&&pp&&pd<16) return { state:pd<2.6?"attack":"hunt", target:pp, player:true }; if(motion.species==="fox"){ const prey=nearest(root,"rabbit",animal); if(prey.best&&prey.distance<30) return { state:prey.distance<2.4?"attack":"hunt", target:prey.best.position }; } if(motion.species==="rabbit"){ const predator=nearest(root,"fox",animal); if(predator.best&&predator.distance<24) return {state:"flee",target:predator.best.position}; } if(motion.species==="deer"&&pp&&pd<17) return { state:"fleePlayer", target:pp }; if(motion.wait>0) return { state:motion.species==="frog"?"drink":"graze" }; return { state:motion.species==="goat"?"climb":"wander" }; }
function choose(root,animal,motion,olam){ return decisionFromWildlifeCombat(animal,olam)||animal.userData?.lifeDecision||oldChoose(root,animal,motion,olam); }
function chooseWaypoint(m){ m.waypoint++; const a=rand(m.seed,m.waypoint)*Math.PI*2,r=Math.sqrt(rand(m.waypoint,m.seed+4))*m.radius; m.destX=m.homeX+Math.cos(a)*r; m.destZ=m.homeZ+Math.sin(a)*r*.72; m.wait=.7+rand(m.waypoint,81)*2.8; }
function target(animal,m,decision){ if(decision.state==="return_home") return {x:m.homeX,z:m.homeZ}; if(!decision.target) return {x:m.destX,z:m.destZ}; const tx=decision.target.x??decision.target.position?.x??m.destX,tz=decision.target.z??decision.target.position?.z??m.destZ,dx=tx-animal.position.x,dz=tz-animal.position.z; return String(decision.state).toLowerCase().includes("flee")?{x:animal.position.x-dx,z:animal.position.z-dz}:{x:tx,z:tz}; }
function damagePlayer(olam,m,dt){ m.attackCooldown=Math.max(0,(m.attackCooldown||0)-dt); if(m.attackCooldown>0) return; m.attackCooldown=1.35; const p=olam&&(olam.player||olam.chossid); p?.ayshPeula?.("damage",{ amount:4, source:"wildlife" }); }
function partitionFor(olam){ const b=globalThis?.__AWTSMOOS_PERFORMANCE_MODE__?.budget||{}; return getDynamicActorPartition(olam).configure({ near:b.npcDistance||48, mid:(b.npcDistance||48)*1.8, far:(b.treeDistance||120)*2.2 }); }
function birdAltitude(m,d){ const flap=Math.sin(m.animTime*m.wingBeat+m.phase)*.58; if(["landNest","hopPeck"].includes(d.state)) return .35; if(["swoop","takeoffAlarm"].includes(d.state)) return Math.max(2.4,m.altitude-1.5+flap); return m.altitude+flap+Math.sin(m.animTime*.7+m.phase)*.95; }
function moveAnimal(animal,m,d,olam,dt){ m.animTime+=dt; if(d2(animal.position,{x:m.destX,z:m.destZ})<2.2){ m.wait=Math.max(0,m.wait-dt); if(m.wait<=0) chooseWaypoint(m); } const tar=target(animal,m,d),dx=tar.x-animal.position.x,dz=tar.z-animal.position.z,dist=len(dx,dz),active=dist>.35&&!["graze","drink","attack","eat","socialIdle"].includes(d.state),scale=active?m.speed*(FAST.has(d.state)?2.15:.72)/dist:0; m.vx+=(dx*scale-m.vx)*(1-Math.exp(-dt*4.5)); m.vz+=(dz*scale-m.vz)*(1-Math.exp(-dt*4.5)); animal.position.x+=m.vx*dt; animal.position.z+=m.vz*dt; animal.position.y=groundY(olam,animal.position.x,animal.position.z)+(m.groundLift||.035)+(m.species==="bird"?birdAltitude(m,d):0); if(m.vx*m.vx+m.vz*m.vz>.004) animal.rotation.y=Math.atan2(m.vx,m.vz); if(d.player&&d.state==="attack") damagePlayer(olam,m,dt); }
function tick(root,olam,dt=1/60){ const delta=Math.min(.05,Math.max(.001,Number(dt)||1/60)), partition=partitionFor(olam); root.userData.lifeRuntime?.tick(delta,partition); for(const child of root.children){ const m=child.userData?.motion; if(!m||!partition.shouldUpdate(child,olam)) continue; if(child.userData.health?.dead){ animateAnimal(child,delta,"death"); continue; } const d=choose(root,child,m,olam); m.state=d.state; moveAnimal(child,m,d,olam,delta); animateAnimal(child,delta,m.state); child.userData.state=m.state; child.userData.creatureCombatState=child.__creatureState||child.userData.creatureCombatState; } }

function registerForProof(root){
  const scope=globalThis;
  scope.__MITZVAH_WILDLIFE_ROOTS__ ||= [];
  if(!scope.__MITZVAH_WILDLIFE_ROOTS__.includes(root)) scope.__MITZVAH_WILDLIFE_ROOTS__.push(root);
  scope.__MITZVAH_REGISTERED_WILDLIFE__ ||= [];
  root.children.forEach(child=>{ if(!scope.__MITZVAH_REGISTERED_WILDLIFE__.includes(child)) scope.__MITZVAH_REGISTERED_WILDLIFE__.push(child); scope.__MITZVAH_REGISTER_ANIMAL__?.(child); });
  scope.__MITZVAH_SCAN_ANIMALS__?.();
}
export function buildWildlifeRenderer(olam,report={}){ const backend=ensureRenderBackend(), root=backend.group("living_region_single_mesh_wildlife_runtime"); animalsFromReport(report).forEach((animal,i)=>root.add(makeActor(animal,i,olam,backend))); root.userData.lifeRuntime=createWildlifeLifeRuntime(root,olam,report); root.userData.tick=delta=>tick(root,olam,delta); const counts=root.children.map(countMeshes); root.userData.stats={ wildlife:root.children.length, foxes:root.children.filter(c=>c.userData?.species==="fox").length, singleMeshAnimals:counts.every(c=>c===1), meshCounts:counts, maxMeshesPerAnimal:Math.max(0,...counts), foxAlwaysDetailed:true, livingEcosystem:true, renderBackend:backend.name, proofRegistered:true, fpsCadenceSec:guardianWildlifeCadence(), moreAnimals:true, tieredAnimalLOD:true, detailedNearAnimals:10 }; sealRegionVisual(root,{ realisticWildlife:true, trueSkinnedAnimals:true, livingEcosystem:true, skipRaycast:true, singleMeshAnimals:true }); root.children.forEach(restoreFlags); registerForProof(root); return root; }
function guardianWildlifeCadence(){ return Number(globalThis.__AWTSMOOS_FPS_GUARDIAN__?.config?.wildlifeTickSec) || .45; }
export function installWildlifeTicker(olam,root){ if(!olam||!root?.userData?.tick||olam.__livingRegionWildlifeTicker) return; let acc=0; const ticker={ name:"living_region_wildlife_ticker", type:"livingRegionTicker", isReady:true, heesHawveh:true, heesHawvoos:dt=>{ acc+=Number(dt)||0; const cadence=guardianWildlifeCadence(); if(acc<cadence) return; const step=Math.min(cadence*1.35,acc); acc=0; root.userData.tick(step); } }; olam.__livingRegionWildlifeTicker=ticker; olam.__livingRegionWildlifeRoot=root; if(Array.isArray(olam.nivrayim)&&!olam.nivrayim.includes(ticker)) olam.nivrayim.push(ticker); }
