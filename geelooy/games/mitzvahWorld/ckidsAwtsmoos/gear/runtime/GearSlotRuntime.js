// B"H
/** @file GearSlotRuntime.js @description Equips clothing into slots and keeps one truth for player appearance stats. */
import { clothingStats } from "./ClothingStatCatalog.js";
export class GearSlotRuntime {
  constructor(runtime) { this.runtime=runtime; this.byActor=new Map(); }
  slots(actorId) { if(!this.byActor.has(actorId)) this.byActor.set(actorId,{}); return this.byActor.get(actorId); }
  equip(actorId,itemId) { const item=clothingStats(itemId); if(!item) return { ok:false, reason:"not-clothing", itemId }; const slots=this.slots(actorId); slots[item.slot]={ id:itemId, ...item }; this.runtime?.registerEntity?.({ id:`gear_${actorId}_${item.slot}`, kind:"gearSlot", tags:["gear",actorId,item.slot], actorId, itemId, slot:item.slot, item }); return { ok:true, actorId, itemId, slot:item.slot, item }; }
  unequip(actorId,slot) { const slots=this.slots(actorId), old=slots[slot]||null; delete slots[slot]; return { ok:Boolean(old), old }; }
  snapshot(actorId=null) { return actorId ? { actorId, slots:this.slots(actorId) } : { actors:Object.fromEntries(this.byActor) }; }
}
export function createGearSlotRuntime(runtime){ return new GearSlotRuntime(runtime); }
export default createGearSlotRuntime;
