// B"H
/** Camera commands wait here until a renderer chooses to obey. */
export class CameraCommandQueue {
  constructor(seed = []) { this.commands = [...seed]; }
  push(command = {}) { const row = { id:command.id || `camera_${this.commands.length+1}`, at:Date.now(), ...command }; this.commands.push(row); return row; }
  drain() { const out = [...this.commands]; this.commands.length = 0; return out; }
  snapshot() { return this.commands.map(c => ({ ...c })); }
}
export default CameraCommandQueue;
