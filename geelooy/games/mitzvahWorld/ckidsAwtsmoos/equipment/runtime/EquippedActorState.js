// B"H
/** @file EquippedActorState.js @description Tracks what each actor is actually holding now. */
export class EquippedActorState {
  constructor(runtime) { this.runtime = runtime; this.byActor = new Map(); }
  equip(actorId, item, attachment = null) { const state = { actorId, itemId:item?.id || null, item, attachment, at:Date.now() }; this.byActor.set(actorId, state); this.runtime?.registerEntity?.({ id:`equipState_${actorId}`, kind:"equipmentState", tags:["equipment", actorId], ...state }); return state; }
  unequip(actorId) { const old = this.byActor.get(actorId) || null; this.byActor.delete(actorId); this.runtime?.registerEntity?.({ id:`equipState_${actorId}`, kind:"equipmentState", tags:["equipment", actorId], itemId:null, at:Date.now() }); return old; }
  current(actorId) { return this.byActor.get(actorId) || null; }
  snapshot() { return { count:this.byActor.size, actors:[...this.byActor.values()] }; }
}
export function createEquippedActorState(runtime) { return new EquippedActorState(runtime); }
export default createEquippedActorState;
