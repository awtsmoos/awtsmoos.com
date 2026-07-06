// B"H
/** @file EquippedWeaponFeaturePack.js @description Visible equipment pipeline with trainer gates, mesh, hand, animation, projectiles, and impacts. */
import { equipmentList, equipmentById } from "./EquipmentItemCatalog.js";
import { createHandAttachmentRuntime } from "./HandAttachmentRuntime.js";
import { resolveCombatAnimation } from "./CombatAnimationResolver.js";
import { createHebrewLetterProjectileRuntime } from "./HebrewLetterProjectileRuntime.js";
import { createHeldMeshDescriptor } from "./HeldMeshDescriptorFactory.js";
import { createEquippedActorState } from "./EquippedActorState.js";
import { createProjectileMotionRuntime } from "./ProjectileMotionRuntime.js";
import { createEquipmentActionRouter } from "./EquipmentActionRouter.js";
import { createEquipmentVisualRuntime } from "../render/EquipmentVisualRuntime.js";
import { createProjectileVisualRuntime } from "../render/ProjectileVisualRuntime.js";
import { createEquipmentAnimationBridge } from "./EquipmentAnimationBridge.js";
import { createEquipmentImpactRuntime } from "./EquipmentImpactRuntime.js";
export function installEquippedWeaponFeaturePack(runtime) {
  const handAttachments=createHandAttachmentRuntime(runtime), hebrewProjectiles=createHebrewLetterProjectileRuntime(runtime), state=createEquippedActorState(runtime), motion=createProjectileMotionRuntime(runtime), visuals=createEquipmentVisualRuntime(runtime), projectileVisuals=createProjectileVisualRuntime(runtime), animations=createEquipmentAnimationBridge(runtime), impacts=createEquipmentImpactRuntime(runtime);
  for (const item of equipmentList()) runtime?.registerEntity?.({ ...item, kind:"equipmentItem", tags:["equipment", ...(item.tags || [])] });
  const router=createEquipmentActionRouter({ runtime, state, projectiles:hebrewProjectiles, motion, meshFactory:createHeldMeshDescriptor, resolver:resolveCombatAnimation });
  const canEquip=(actorId,item)=>runtime?.trainers?.canUse?.(actorId,item)||{ok:true,missing:[]};
  const api={ items:equipmentList(), equipmentById, canEquip, handAttachments, hebrewProjectiles, state, motion, visuals, projectileVisuals, animations, impacts, router, createHeldMeshDescriptor, resolveCombatAnimation,
    equip:(actorId,itemId,actorRoot,mesh=null)=>{ const item=equipmentById(itemId); if(!item) return {ok:false,reason:"missing-item",actorId,itemId}; const gate=canEquip(actorId,item); if(!gate.ok) return {ok:false,reason:"trainer-required",actorId,itemId,gate}; const visual=mesh?{object:mesh}:visuals.create(createHeldMeshDescriptor(item)); const equipped=router.equip(actorId,item,(a,i,r,m)=>handAttachments.attach({actorId:a,actorRoot:r,item:equipmentById(i),mesh:m}),actorRoot,visual.object); return { ok:true, ...equipped, visual:visual.descriptor||null }; },
    unequip:actorId=>state.unequip(actorId), attack:(actorId, action="attack")=>{ const result=router.act(actorId, action); if(result.projectile) projectileVisuals.create(result.projectile); result.animation=animations.plan(actorId,result); return result; },
    tickProjectiles:(dt,target)=>{ const hits=motion.tick(dt); for(const hit of hits){ projectileVisuals.impact(hit.id); hit.purification=impacts.apply(hit,target); } return hits; },
    snapshot:()=>({ state:state.snapshot(), attachments:handAttachments.snapshot(), visuals:visuals.snapshot(), projectiles:hebrewProjectiles.snapshot(), projectileVisuals:projectileVisuals.snapshot(), motion:motion.snapshot(), animations:animations.snapshot(), impacts:impacts.snapshot() }) };
  runtime.equipment=api; runtime?.markReady?.("equipment:weapons", { items:api.items.length, pipeline:"visible-animation-impact-gated" }); return api;
}
export default installEquippedWeaponFeaturePack;
