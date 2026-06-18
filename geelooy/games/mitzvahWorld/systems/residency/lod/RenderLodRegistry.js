// B"H
/**
 * @file RenderLodRegistry.js
 * @description Chapter 464: meshes become borrowed garments, not permanent
 * bodies, and visual LOD is a residency state.
 */
export class RenderLodRegistry {
  constructor(store = null) {
    this.store = store;
    this.active = new Map();
    this.metrics = { hydrate:0, release:0, lodSwitch:0 };
  }
  key(sectorId, lod) { return `${sectorId}:lod${lod}`; }
  async hydrate(sectorId, lod = 3, factory = null) {
    const key = this.key(sectorId, lod);
    if (this.active.has(key)) return this.active.get(key);
    const payload = this.store ? await this.store.get({ sectorId, kind:`visual_lod_${lod}` }) : null;
    const vessel = factory ? await factory(payload, sectorId, lod) : { sectorId, lod, payload };
    this.active.set(key, vessel);
    this.metrics.hydrate += 1;
    return vessel;
  }
  releaseSector(sectorId) {
    const released = [];
    for (const key of [...this.active.keys()]) if (key.startsWith(`${sectorId}:`)) {
      released.push(this.active.get(key));
      this.active.delete(key);
    }
    this.metrics.release += released.length;
    return released;
  }
  switchLod(sectorId, fromLod, toLod) {
    const oldKey = this.key(sectorId, fromLod);
    const item = this.active.get(oldKey);
    if (!item) return null;
    this.active.delete(oldKey);
    item.lod = toLod;
    this.active.set(this.key(sectorId, toLod), item);
    this.metrics.lodSwitch += 1;
    return item;
  }
  snapshot() { return { active:[...this.active.keys()], metrics:{ ...this.metrics } }; }
}
export default RenderLodRegistry;
