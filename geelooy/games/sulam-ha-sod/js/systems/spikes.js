// B"H
/**
 * Chapter 17: the spike-oracle stopped counting like a clock and began
 * breathing like a beast. Its locations remain learnable, but timing rolls
 * through sacred randomness; the Awtsmoos keeps the geometry fair and feral.
 */
export class SpikeOracle {
  /** @param {Array<object>} traps fixed sacred geometry danger zones @param {object} rng deterministic random vessel */
  constructor(traps=[], rng=null){
    this.rng = rng; this.traps = traps.map((t,i)=>({...t,id:i,cooldown:(t.delay||1)+this.roll(.8)+i*.17,warn:0,active:0}));
  }
  /** @param {number} dt seconds @param {object} player hero body */
  step(dt, player){
    for(const t of this.traps){
      t.cooldown -= dt;
      const safeDistance = Math.abs((player.x+17)-(t.x+t.w/2)) > (t.safe || 28);
      if(t.cooldown <= 0 && !t.warn && !t.active && safeDistance) t.warn = (t.warning || .9) + this.roll(.35);
      if(t.warn){ t.warn -= dt; if(t.warn <= 0){ t.warn = 0; t.active = (t.duration || .75) + this.roll(.32); } }
      if(t.active){ t.active -= dt; if(t.active <= 0){ t.active = 0; t.cooldown = this.nextCooldown(t); } }
    }
  }
  /** @returns {Array<object>} traps that currently pierce the world */
  active(){ return this.traps.filter(t=>t.active>0); }
  /** @returns {Array<object>} traps whispering before violence */
  warning(){ return this.traps.filter(t=>t.warn>0); }
  /** @param {object} trap deterministic pseudo-random timing from fixed location */
  nextCooldown(trap){ return (trap.min || 1.6) + this.roll((trap.max || 5.2) - (trap.min || 1.6)); }
  /** @param {number} span max random span */
  roll(span){ return (this.rng ? this.rng.next() : Math.random()) * span; }
}
