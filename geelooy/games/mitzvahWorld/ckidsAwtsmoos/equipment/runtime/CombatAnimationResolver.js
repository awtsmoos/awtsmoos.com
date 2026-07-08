// B"H
/** @file CombatAnimationResolver.js @description Equipped item and action choose custom action plans, phase timing, and projectile behavior. */
import { actionForItem } from "./WeaponActionCatalog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { posePlanForAction } from "./WeaponPosePlanRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
function inferProjectile(item,actionPlan,phase){ if(actionPlan.projectile) return actionPlan.projectile; if((item?.genre==="bow"||item?.genre==="crossbow")&&phase==="release") return item.projectileType||"arrow"; return null; }
export function resolveCombatAnimation({item=null,action="attack",moving=false,charged=false,phase="release"}={}){ const actionPlan=actionForItem(item,action,phase), pose=posePlanForAction(actionPlan,item||{}), projectile=inferProjectile(item,actionPlan,phase); return {clip:actionPlan.clip,overlay:moving?"mw_move_upper_blend":null,projectile,genre:item?.genre||"hands",combo:item?.attackCombo||[actionPlan.id],reason:actionPlan.id,handMode:actionPlan.handMode,pose,actionPlan,charged,phase}; }
export default resolveCombatAnimation;
