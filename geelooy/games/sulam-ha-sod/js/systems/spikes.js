// B"H
/**
 * Chapter 5: the floor learned to lie politely. A blue crack breathed,
 * dust climbed upward like frightened incense, and only then did the spikes
 * erupt, because the Awtsmoos makes even terror keep covenant with fairness.
 */
export class SpikeOracle {
  /** @param {Array<object>} traps fixed sacred geometry danger zones */
  constructor(traps=[]){ this.traps = traps.map((t,i)=>({...t,id:i,cooldown:(t.delay||1)+i*.37,warn:0,active:0})); }
  /** @param {number} dt seconds @param {object} player hero body */
  step(dt, player){
    for(const t of this.traps){
      t.cooldown -= dt;
      if(t.cooldown <= 0 && !t.warn && !t.active && Math.abs((player.x+17)-(t.x+t.w/2)) > 28) t.warn = t.warning || .9;
      if(t.warn){ t.warn -= dt; if(t.warn <= 0){ t.warn = 0; t.active = t.duration || .75; } }
      if(t.active){ t.active -= dt; if(t.active <= 0){ t.active = 0; t.cooldown = nextCooldown(t); } }
    }
  }
  /** @returns {Array<object>} traps that currently pierce the world */
  active(){ return this.traps.filter(t=>t.active>0); }
  /** @returns {Array<object>} traps whispering before violence */
  warning(){ return this.traps.filter(t=>t.warn>0); }
}

/** @param {object} trap deterministic pseudo-random timing from fixed location */
function nextCooldown(trap){
  const seed = ((trap.x * 17 + trap.y * 31 + trap.id * 43) % 100) / 100;
  return (trap.min || 2.4) + seed * ((trap.max || 5.8) - (trap.min || 2.4));
}
