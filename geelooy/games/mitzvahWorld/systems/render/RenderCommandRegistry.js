// B"H
/** Registry for renderer-agnostic command batches. */
export class RenderCommandRegistry {
  constructor() { this.batches = []; }
  register(batch = {}) { const row = { id:batch.id || `render_batch_${this.batches.length+1}`, at:new Date().toISOString(), batch }; this.batches.push(row); return row; }
  latest() { return this.batches[this.batches.length - 1] || null; }
  snapshot() { return { batches:this.batches.length, latest:this.latest() }; }
}
export default RenderCommandRegistry;
