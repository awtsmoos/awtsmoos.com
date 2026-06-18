// B"H
/**
 * @file ColliderPayloadRegistry.js
 * @description Chapter 463: collider octrees become sector payloads, hydrated
 * only when needed, released only after their truth is preserved.
 */
export class ColliderPayloadRegistry {
  constructor(store = null) {
    this.store = store;
    this.active = new Map();
    this.metrics = { hydrate:0, release:0, store:0 };
  }
  async hydrate(sectorId, factory = null) {
    if (this.active.has(sectorId)) return this.active.get(sectorId);
    const payload = this.store ? await this.store.get({ sectorId, kind:"collider" }) : null;
    const chunk = factory ? await factory(payload, sectorId) : { sectorId, payload, colliderLod:"bounds" };
    this.active.set(sectorId, chunk);
    this.metrics.hydrate += 1;
    return chunk;
  }
  async persist(sectorId) {
    const chunk = this.active.get(sectorId);
    if (this.store && chunk) {
      await this.store.put({ sectorId, kind:"collider", payload:chunk.payload || chunk });
      this.metrics.store += 1;
    }
  }
  release(sectorId) {
    const chunk = this.active.get(sectorId);
    this.active.delete(sectorId);
    this.metrics.release += 1;
    return chunk || null;
  }
  snapshot() { return { active:[...this.active.keys()], metrics:{ ...this.metrics } }; }
}
export default ColliderPayloadRegistry;
