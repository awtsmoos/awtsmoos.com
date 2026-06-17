// B"H
/** Global-ish runtime registry, passed around explicitly when possible. */
export class UniverseRuntimeRegistry {
  constructor() { this.records = []; }
  add(record = {}) { const row = { id:record.id || `universe_runtime_${this.records.length+1}`, at:new Date().toISOString(), ...record }; this.records.push(row); return row; }
  latest() { return this.records[this.records.length - 1] || null; }
  snapshot() { return { records:this.records.length, latest:this.latest() }; }
}
export const defaultUniverseRuntimeRegistry = new UniverseRuntimeRegistry();
export default UniverseRuntimeRegistry;
