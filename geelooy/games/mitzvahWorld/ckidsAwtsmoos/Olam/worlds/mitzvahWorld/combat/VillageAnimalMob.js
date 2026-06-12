// B"H
/**
 * @file VillageAnimalMob.js
 * @description
 * Chapter 711: approach becomes smooth on Android.
 * The beast keeps its bite, but close pursuit now uses squared distance, low-cost
 * terrain-law navigation, throttled debug, and less per-frame ceremony. It runs
 * to the player without asking the octree a hundred questions per second.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { getVillageGroundNavigator } from "./VillageGroundNavigator.js?v=android-smooth-chase-20260612-bh1";
import { createVillageAnimal, disposeVillageAnimal } from "./VillageAnimalFactory.js";

const scratch = new THREE.Vector3(), away = new THREE.Vector3();
const now = () => (globalThis.performance?.now?.() || Date.now()) / 1000;
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const v3 = (p = {}) => new THREE.Vector3(Number(p.x) || 0, Number(p.y) || 0, Number(p.z) || 0);
const ATK = { fox:{name:"snap",color:"#ff9b45",windupRange:2.85,hitRange:2.35,cooldown:1.05,windup:.22,strike:.18,recover:.48,lungeSpeed:8.8}, wolf:{name:"lunge",color:"#d7e6ff",windupRange:3.15,hitRange:2.65,cooldown:1.25,windup:.26,strike:.22,recover:.55,lungeSpeed:9.2}, ram:{name:"bash",color:"#fff0a8",windupRange:3.35,hitRange:2.9,cooldown:1.45,windup:.34,strike:.24,recover:.62,lungeSpeed:8}, stag:{name:"antler sweep",color:"#c9ff9d",windupRange:3.55,hitRange:3.05,cooldown:1.55,windup:.36,strike:.26,recover:.64,lungeSpeed:8.4} };
function ppos(player) { return player?.mesh?.position || player?.modelMesh?.position || player?.guf?.position || null; }
function d2(a, b) { return a && b ? a.distanceToSquared(b) : Infinity; }
function flash(root, color, ms) { const hex = new THREE.Color(color).getHex(); root?.traverse?.(c => c.material?.emissive?.setHex?.(hex)); setTimeout(() => root?.traverse?.(c => c.material?.emissive?.setHex?.(0)), ms); }
function damage(player, amount, olam) { if (typeof player?.takeDamage === "function") return player.takeDamage(amount); const s = player?.currentStats; if (!s) return 0; s.maxHealth ||= 100; s.health = Math.max(0, n(s.health, s.maxHealth) - amount); olam?.ayshPeula?.("ui event", "gameHUD", { updateStats: { hp:s.health, maxHp:s.maxHealth } }); return amount; }

export default class VillageAnimalMob {
  constructor(olam, def, state) {
    this.olam=olam; this.def=def; this.state=state; this.id=def.id; this.name=def.name; this.type="mazik"; this.elementalType="wildAnimal"; this.species=def.species||"fox";
    this.hp=n(def.hp,60); this.maxHp=this.hp; this.damage=n(def.damage,8); this.xpValue=n(def.xp,25); this.perutas=n(def.perutas,3); this.speed=n(def.speed,3.7); this.groundLift=n(def.groundLift,.28); this.aggroRange=n(def.aggro,18);
    this.attackData={...(ATK[this.species]||ATK.fox)}; this.windupRange=n(def.windupRange,this.attackData.windupRange); this.hitRange=n(def.hitRange,n(def.attackRange,this.attackData.hitRange)); this.chaseStopDistance=n(def.chaseStopDistance,Math.max(1.05,this.hitRange*.68)); this.attackCooldown=n(def.attackCooldown,this.attackData.cooldown);
    this.spawn=v3(def.position); this.target=this.spawn.clone(); this.clock=Math.random()*100; this.stateName="patrol"; this.stateUntil=0; this.lastAttackAt=-99; this.damageDone=false; this.orbitSign=Math.random()<.5?-1:1; this.isReady=true; this.heesHawveh=true; this.isDead=false; this.lowCostChase=false; this.__debugAt=0;
    this.mesh=this.buildMesh(); this.mesh.position.copy(this.spawn); this.rig=this.mesh.userData.rigParts||{}; this.navigator=getVillageGroundNavigator(olam); this.navigator.snap(this);
  }
  buildMesh() { const g=new THREE.Group(); g.name=this.name; g.nivraAwtsmoos=this; Object.assign(g.userData,{isEnemy:true,isVillageWildlife:true}); const rig=createVillageAnimal(this.def,this); g.userData.rigParts=rig.userData.rigParts||{}; g.add(rig); g.traverse(c=>{c.nivraAwtsmoos=this; Object.assign(c.userData||={}, {isEnemy:true,isVillageWildlife:true,skipOctree:true,noOctree:true});}); return g; }
  heesHawvoos(dt=1/60) { if (this.isDead||!this.mesh) return; const delta=Math.min(.06,n(dt,1/60)); this.clock+=delta; const player=this.olam?.player||this.olam?.chossid, pos=ppos(player); if(!pos) return this.patrol(delta); const dist2=d2(this.mesh.position,pos); if(dist2>this.aggroRange*this.aggroRange && this.stateName!=="patrol") this.setState("patrol"); ({patrol:()=>this.patrol(delta,pos,dist2),chase:()=>this.chase(delta,player,pos,dist2),windup:()=>this.windup(pos),strike:()=>this.strike(delta,player,pos),recover:()=>this.recover(delta,pos)}[this.stateName]||(()=>this.patrol(delta,pos,dist2)))(); this.animateRig(delta,pos); this.writeDebug(player,dist2); }
  setState(name, seconds=0) { this.stateName=name; this.stateUntil=now()+seconds; this.damageDone=false; this.lowCostChase=name==="chase"||name==="strike"; if(this.mesh) this.mesh.userData.animalState=name; }
  ready() { return now()-this.lastAttackAt>=this.attackCooldown; }
  face(point) { if(!point||!this.mesh) return; scratch.copy(point).sub(this.mesh.position); scratch.y=0; if(scratch.lengthSq()>.0001) this.mesh.rotation.y=Math.atan2(scratch.x,scratch.z)+Math.PI; }
  patrol(dt, pos=null, dist2=Infinity) { this.lowCostChase=false; if(pos&&dist2<this.aggroRange*this.aggroRange) return this.setState("chase"); this.navigator.move(this,this.patrolTarget(),dt,.42,0); }
  chase(dt, player, pos, dist2) { if(dist2<=this.windupRange*this.windupRange&&this.ready()) return this.beginWindup(pos); this.lowCostChase=true; this.navigator.move(this,pos,dt,1.28,this.chaseStopDistance); if(d2(this.mesh.position,ppos(player))<=this.windupRange*this.windupRange&&this.ready()) this.beginWindup(ppos(player)); }
  beginWindup(pos) { this.windupTarget=pos?.clone?.()||null; flash(this.mesh,this.attackData.color,120); this.spawnWarningRing(); this.setState("windup",this.attackData.windup); }
  windup(pos) { this.lowCostChase=false; this.face(pos||this.windupTarget); if(now()>=this.stateUntil) this.setState("strike",this.attackData.strike); }
  strike(dt, player, pos) { this.lowCostChase=true; if(pos){this.face(pos); this.navigator.move(this,pos,dt,this.attackData.lungeSpeed/Math.max(.1,this.speed),.72);} if(!this.damageDone&&d2(this.mesh.position,ppos(player))<=(this.hitRange+.35)**2) this.dealHit(player); if(now()>=this.stateUntil){this.lastAttackAt=now(); this.setState("recover",this.attackData.recover);} }
  recover(dt,pos){ this.lowCostChase=true; if(pos){away.copy(this.mesh.position).sub(pos); away.y=0; if(away.lengthSq()<.01) away.set(1,0,0); away.normalize(); scratch.copy(this.mesh.position).addScaledVector(away,3.2); this.navigator.move(this,scratch,dt,.9,0);} if(now()>=this.stateUntil) this.setState("chase"); }
  patrolTarget(){ if(this.mesh.position.distanceToSquared(this.target)<1.21){const r=n(this.def.patrol,8); this.target.set(this.spawn.x+(Math.random()-.5)*r*2,this.spawn.y,this.spawn.z+(Math.random()-.5)*r*2);} return this.target; }
  dealHit(player){ this.damageDone=true; const dealt=damage(player,this.damage,this.olam); this.spawnHitArc(ppos(player)); flash(this.mesh,"#fff6b0",90); this.olam?.ayshPeula?.("ui event","effectsOverlay",{text:`${this.name} ${this.attackData.name}: -${Math.round(dealt||this.damage)} HP`,color:this.attackData.color}); }
  spawnWarningRing(){ if(this.__warnAt&&now()-this.__warnAt<.18) return; this.__warnAt=now(); const ring=new THREE.Mesh(new THREE.TorusGeometry(this.hitRange*.42,.025,6,24),new THREE.MeshBasicMaterial({color:new THREE.Color(this.attackData.color),transparent:true,opacity:.7})); ring.name=`${this.name}_windup_warning_ring`; ring.rotation.x=Math.PI/2; ring.position.copy(this.mesh.position); ring.position.y+=.08; this.olam?.scene?.add?.(ring); setTimeout(()=>{ring.material?.dispose?.(); ring.geometry?.dispose?.(); ring.removeFromParent?.();},170); }
  spawnHitArc(pos){ if(!pos) return; const arc=new THREE.Mesh(new THREE.TorusGeometry(.7,.045,6,20,Math.PI*1.25),new THREE.MeshBasicMaterial({color:new THREE.Color(this.attackData.color),transparent:true,opacity:.95})); arc.name=`${this.name}_hit_arc`; arc.position.copy(pos); arc.position.y+=1.05; arc.rotation.set(Math.PI/2,0,this.clock); this.olam?.scene?.add?.(arc); setTimeout(()=>{arc.material?.dispose?.(); arc.geometry?.dispose?.(); arc.removeFromParent?.();},130); }
  animateRig(dt,target){ const base=this.stateName==="strike"?1.09:this.stateName==="windup"?.97:1+Math.sin(this.clock*4.2)*.012; this.mesh.scale.setScalar(base); const head=this.rig.headRoot; if(head) head.rotation.x=this.stateName==="windup"?-.32:this.stateName==="strike"?.22:Math.sin(this.clock*2)*.045; const tail=this.rig.tailRoot; if(tail) tail.rotation.y=Math.sin(this.clock*(this.stateName==="chase"?6.5:3.2))*.22; (this.rig.legs||[]).forEach((leg,i)=>{leg.rotation.x=Math.sin(this.clock*8+i*1.7)*(this.stateName==="patrol"?.06:.14);}); if(target&&(this.stateName==="windup"||this.stateName==="strike")) this.face(target); }
  writeDebug(player,dist2){ const t=now(); if(t-this.__debugAt<.25) return; this.__debugAt=t; this.mesh.userData.__debugAnimalState={state:this.stateName,distance:Number(Math.sqrt(dist2).toFixed(2)),ready:this.ready(),lowCost:this.lowCostChase}; }
  takeDamage(amount){ if(this.isDead) return; this.hp=Math.max(0,this.hp-n(amount,0)); flash(this.mesh,"#fff1a8",90); if(this.hp<=0) this.die(); }
  die(){ this.isDead=true; this.state?.recordKill?.(this); this.olam?.combatManager?.unregisterEnemy?.(this); this.mesh.traverse(c=>{if(c.material)c.material.transparent=true;}); const shrink=()=>{if(!this.mesh)return; this.mesh.scale.multiplyScalar(.84); if(this.mesh.scale.x>.06) requestAnimationFrame(shrink); else this.dispose();}; requestAnimationFrame(shrink); }
  dispose(){ disposeVillageAnimal(this.mesh); this.mesh=null; }
}
