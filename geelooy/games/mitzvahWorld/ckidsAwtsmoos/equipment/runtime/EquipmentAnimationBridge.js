// B"H
/** @file EquipmentAnimationBridge.js @description Bridges equipped weapons into actor animation plans. */
export class EquipmentAnimationBridge {
  constructor(runtime) { this.runtime = runtime; this.history = []; }
  plan(actorId, routeResult = {}) { const clip = routeResult.resolved?.clip || "idle"; const overlay = routeResult.resolved?.overlay || null; const plan = this.runtime?.animation?.planActorAnimation?.({ speed:0, lookAt:null }, clip) || { base:clip, upper:overlay, additive:["breathing"], blendMs:140 }; const final = { actorId, clip, overlay, reason:routeResult.resolved?.reason || "none", plan, at:Date.now() }; this.history.push(final); this.history=this.history.slice(-80); return final; }
  snapshot() { return { count:this.history.length, last:this.history.at(-1) || null }; }
}
export function createEquipmentAnimationBridge(runtime) { return new EquipmentAnimationBridge(runtime); }
export default createEquipmentAnimationBridge;
