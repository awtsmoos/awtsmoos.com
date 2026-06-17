// B"H
/** Animation commands are semantic first, engine-specific later. */
export class AnimationCommandQueue {
  constructor(seed = []) { this.commands = [...seed]; }
  push(target, animation, detail = {}) { const row = { id:`anim_${this.commands.length+1}`, target, animation, detail, at:Date.now() }; this.commands.push(row); return row; }
  snapshot() { return this.commands.map(c => ({ ...c })); }
}
export default AnimationCommandQueue;
