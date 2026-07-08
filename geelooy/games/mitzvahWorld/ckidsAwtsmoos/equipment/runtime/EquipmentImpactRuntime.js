// B"H
/** @file EquipmentImpactRuntime.js @description Converts ranged impacts into purification effects and region changes. */
import { purifyRegion, purificationReward } from "../../combat/runtime/PurificationRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export class EquipmentImpactRuntime {
  constructor(runtime) { this.runtime = runtime; this.impacts = []; }
  apply(impact = {}, target = {}) { const regionId = target.regionId || impact.targetRegionId || "region_unknown_klipah"; const purified = purifyRegion(this.runtime, regionId, { projectileId:impact.id, letter:impact.letter, actorId:impact.actorId }); const reward = purificationReward("hebrew-letter-spark"); const record = { impactId:impact.id, regionId, purified, reward, at:Date.now() }; this.impacts.push(record); this.impacts=this.impacts.slice(-120); return record; }
  snapshot() { return { count:this.impacts.length, last:this.impacts.at(-1) || null }; }
}
export function createEquipmentImpactRuntime(runtime) { return new EquipmentImpactRuntime(runtime); }
export default createEquipmentImpactRuntime;
