// B"H
/**
 * @file ResidencyEngine.js
 * @description Chapter 466: one doorway gathers sector bands, persistence,
 * collider payloads, mesh garments, dirty vows, and diagnostics.
 */
import SectorResidencyManager from "./core/SectorResidencyManager.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import MemorySectorStore from "./store/MemorySectorStore.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import SectorDirtyJournal from "./store/SectorDirtyJournal.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import ColliderPayloadRegistry from "./collider/ColliderPayloadRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import RenderLodRegistry from "./lod/RenderLodRegistry.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class ResidencyEngine {
  constructor({ store = new MemorySectorStore(), sectorSize = 64 } = {}) {
    this.store = store;
    this.manager = new SectorResidencyManager({ sectorSize });
    this.journal = new SectorDirtyJournal(store);
    this.colliders = new ColliderPayloadRegistry(store);
    this.lods = new RenderLodRegistry(store);
  }
  update(x, z) { return this.manager.update(x, z); }
  async flush(worldId = "default") { return this.journal.flush(worldId); }
  snapshot() {
    return {
      manager:this.manager.snapshot(),
      colliders:this.colliders.snapshot(),
      lods:this.lods.snapshot(),
      dirty:this.journal.snapshot()
    };
  }
}
export function installResidencyEngine(host = globalThis, options = {}) {
  if (!host.__AWTS_RESIDENCY_ENGINE__) host.__AWTS_RESIDENCY_ENGINE__ = new ResidencyEngine(options);
  host.__AWTS_RESIDENCY_SNAPSHOT__ = () => host.__AWTS_RESIDENCY_ENGINE__.snapshot();
  return host.__AWTS_RESIDENCY_ENGINE__;
}
export default ResidencyEngine;
