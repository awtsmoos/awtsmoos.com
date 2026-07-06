// B"H
/** @file EquipmentVisualRuntime.js @description Creates visible held objects and records render descriptors. */
import { buildThreeHeldMesh } from "./ThreeHeldMeshBuilder.js";
export class EquipmentVisualRuntime {
  constructor(runtime) { this.runtime = runtime; this.visuals = new Map(); }
  create(descriptor, THREE = globalThis.THREE) { const object = buildThreeHeldMesh(descriptor, THREE); const record = { id:descriptor.id, itemId:descriptor.itemId, object, descriptor, createdAt:Date.now() }; this.visuals.set(descriptor.id, record); this.runtime?.registerEntity?.({ id:descriptor.id, kind:"equipmentVisual", tags:["equipmentVisual", descriptor.itemId], descriptor }); return record; }
  get(id) { return this.visuals.get(id) || null; }
  hide(id) { const visual=this.get(id); if (visual?.object) visual.object.visible = false; return Boolean(visual); }
  snapshot() { return { count:this.visuals.size, visuals:[...this.visuals.values()].map(v => ({ id:v.id, itemId:v.itemId, parts:v.descriptor?.recipe?.parts?.length || 0 })) }; }
}
export function createEquipmentVisualRuntime(runtime) { return new EquipmentVisualRuntime(runtime); }
export default createEquipmentVisualRuntime;
