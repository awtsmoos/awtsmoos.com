// B"H
/**
 * @file collision.js
 * @description
 * Chapter 98: the ray receives an authoritative registry.
 * The Awtsmoos separates terrain, world, decor, and explicit interaction so NaN
 * meshes, decorative forests, and NPC tap boxes no longer fight in one ray.
 */
import { diagThrottle } from "../../../utils/AwtsmoosDiagnostics.js?v=village-diagnostics-20260612-bh1";
const FINITE_LIMIT = 24000;
function finiteArray(arr, limit = FINITE_LIMIT) { if (!arr) return true; for (let i=0;i<Math.min(arr.length,limit);i++) if(!Number.isFinite(arr[i])) return false; return true; }
function boundsFinite(g) { g.computeBoundingBox?.(); g.computeBoundingSphere?.(); const b=g.boundingBox,s=g.boundingSphere; return (!b||[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].every(Number.isFinite))&&(!s||[s.center.x,s.center.y,s.center.z,s.radius].every(Number.isFinite)); }
function geometryIsFinite(g) { if(!g) return true; return finiteArray(g.attributes?.position?.array)&&boundsFinite(g); }
function matrixFinite(o) { const e=o?.matrixWorld?.elements; return !e||e.every(Number.isFinite); }
function markUnsafe(o,reason){ if(!o) return; Object.assign(o.userData||={}, {skipRaycast:true,raycastSkipReason:reason}); diagThrottle("raycast-skip",{name:o.name,reason},1200,"warn"); }
function registryAllows(o, mode="world") { const layer=o?.userData?.interactionLayer; if(layer==="decor") return false; if(mode==="interaction") return layer==="explicit-interaction"||o?.userData?.awtsmoosRayProxy; if(mode==="camera") return layer!=="explicit-interaction"; return true; }
function targetSafe(o, mode="world") { if(!o||o.userData?.skipRaycast||!registryAllows(o,mode)) return false; o.updateMatrixWorld?.(true); if(!matrixFinite(o)){markUnsafe(o,"nan-matrix");return false;} if(o.geometry&&!geometryIsFinite(o.geometry)){markUnsafe(o,"nan-geometry");return false;} return true; }
function collectLeaves(o, recursive, mode) { const leaves=[]; const visit=c=>{ if(!targetSafe(c,mode)) return; if(c.raycast&&(c.isMesh||c.isLine||c.isPoints||c.isSprite)) leaves.push(c); if(recursive) for(const s of c.children||[]) visit(s); }; visit(o); return leaves; }
function safeIntersect(raycaster,o,recursive=false,mode="world"){ if(!targetSafe(o,mode)) return []; const hits=[]; for(const t of collectLeaves(o,recursive,mode)){ try{ hits.push(...raycaster.intersectObject(t,false)); } catch(e){ markUnsafe(t,e?.message||"raycast-error"); } } return hits.filter(h=>Number.isFinite(h.distance)).sort((a,b)=>a.distance-b.distance); }
function isNpcLike(n){ return n?.type==="interactiveNpc"||n?.type==="customNpc"||n?.type==="medabeir"; }
function targetForNivra(n){ if(!n||n.type==='chossid'||n.type==='spikeHazard'||n.type==='proceduralTerrain') return null; if(n.raycastMesh) return n.raycastMesh; if(n.interactionMesh) return n.interactionMesh; if(isNpcLike(n)) return null; return n.mesh||n.modelMesh||null; }
function validNivraTarget(n){ const m=targetForNivra(n); return !!m&&!m.userData?.skipRaycast; }
export default {
  updateSceneObjects(newObjects){ this.objectsInScene=newObjects; this.previousResults.clear(); },
  performOptimizedRaycasting(isCorrected){ const changed=this.isSceneChanged(); for(const obj of this.objectsInScene){ if(!obj||obj.userData?.skipRaycast) continue; const results=changed||!this.previousResults.has(obj)?safeIntersect(this.raycaster,obj,true,"camera"):this.previousResults.get(obj); this.previousResults.set(obj,results); if(results.length){ const d=results[0].distance-this.offsetFromWall; if(Number.isFinite(d)&&d<this.correctedDistance){ this.correctedDistance=d; isCorrected=true; } } } return isCorrected; },
  getHovered(startAlternative,directionAlternative){ if(startAlternative&&directionAlternative) this.mouseRaycaster.set(startAlternative,directionAlternative.multiplyScalar(-1)); else this.mouseRaycaster.setFromCamera(this.olam.pointer,this.camera); let closest=null; for(const nivra of this.olam.interactableNivrayim||[]){ if(!validNivraTarget(nivra)) continue; const target=targetForNivra(nivra), recursive=!target.userData?.awtsmoosRayProxy&&!isNpcLike(nivra), hits=safeIntersect(this.mouseRaycaster,target,recursive,"interaction"); if(hits.length&&(!closest||hits[0].distance<closest.distance)) closest={distance:hits[0].distance,point:hits[0].point,object:hits[0].object,nivraAwtsmoos:nivra}; }
    const oct=this.olam.interactiveOctree?.rayIntersect?.(this.mouseRaycaster.ray); if(oct&&Number.isFinite(oct.distance)&&(!closest||oct.distance<closest.distance)){ oct.point=oct.point||oct.position; if(oct.triangle) oct.object=oct.triangle.sourceMesh||oct.object; if(oct.object?.nivraAwtsmoos) oct.nivraAwtsmoos=oct.object.nivraAwtsmoos; closest=oct; } return closest||null; },
  isSceneChanged(){ return false; }
};
