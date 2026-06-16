// B"H
/** @file ProgressTracker.js @description Legacy quest tracker bridged to modern mission payloads. */
export default class ProgressTracker {
  constructor(shlichus = null) { this.shlichus = shlichus; this.progress = {}; this.completed = false; }
  setObjective(id, required = 1) { this.progress[id] ||= { id, progress:0, required }; return this.progress[id]; }
  add(id, amount = 1, required = 1) { const row = this.setObjective(id, required); row.progress = Math.min(row.required, Number(row.progress || 0) + Math.max(1, amount)); this.completed = Object.values(this.progress).every(o => o.progress >= o.required); return row; }
  payload() { return { completed:this.completed, objectives:Object.values(this.progress), shlichusId:this.shlichus?.id || null }; }
  reset() { this.progress = {}; this.completed = false; return this; }
}
