// B"H
/**
 * @file SectorDirtyJournal.js
 * @description Chapter 462: dirty changes are written as vows before memory is
 * released, so no sector vanishes before its testimony is stored.
 */
export class SectorDirtyJournal {
  constructor(store) {
    this.store = store;
    this.pending = new Map();
  }
  mark(sectorId, kind, payload) {
    const key = `${sectorId}:${kind}`;
    this.pending.set(key, { sectorId, kind, payload, at:Date.now() });
    return key;
  }
  async flush(worldId = "default") {
    const written = [];
    for (const [key, entry] of this.pending) {
      await this.store.put({ worldId, sectorId:entry.sectorId, kind:entry.kind, payload:entry.payload });
      this.pending.delete(key);
      written.push(key);
    }
    return written;
  }
  snapshot() { return [...this.pending.values()]; }
}
export default SectorDirtyJournal;
