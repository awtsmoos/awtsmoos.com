// B"H
/**
 * @file MemorySectorStore.js
 * @description Chapter 460: a tiny in-memory shadow of IndexedDB for tests,
 * unsupported vessels, and deterministic proofs.
 */
export class MemorySectorStore {
  constructor() { this.map = new Map(); }
  key(worldId, sectorId, kind, version = "v1") {
    return `${worldId}:${sectorId}:${kind}:${version}`;
  }
  async put({ worldId = "default", sectorId, kind, version = "v1", payload }) {
    this.map.set(this.key(worldId, sectorId, kind, version), payload);
    return true;
  }
  async get({ worldId = "default", sectorId, kind, version = "v1" }) {
    return this.map.get(this.key(worldId, sectorId, kind, version)) || null;
  }
  async delete(args) {
    this.map.delete(this.key(args.worldId || "default", args.sectorId, args.kind, args.version || "v1"));
    return true;
  }
  async keys() { return [...this.map.keys()]; }
}
export default MemorySectorStore;
