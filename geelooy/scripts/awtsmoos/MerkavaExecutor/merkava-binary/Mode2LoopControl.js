// B"H
/**
 * Minimal loop-control bookkeeping for MD2.
 */
class Mode2LoopControl {
  constructor(){ this.stack=[]; }
  enter(loop){ this.stack.push(loop); return loop; }
  exit(){ return this.stack.pop(); }
  current(){ return this.stack[this.stack.length-1]||null; }
}

module.exports={Mode2LoopControl};
