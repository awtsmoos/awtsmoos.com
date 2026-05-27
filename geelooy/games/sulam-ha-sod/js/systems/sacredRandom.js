// B"H
/**
 * Chapter 12: chance put on a crown and confessed it was never chaos.
 * A seed is a tiny throne-room; numbers bow, teeth awaken, bridges spin,
 * and the Awtsmoos lets surprise feel wild while still obeying hidden law.
 */
export class SacredRandom {
  /** @param {number} seed stable beginning for repeatable dream physics */
  constructor(seed=770){ this.seed = seed >>> 0; }
  /** @returns {number} between 0 and 1 */
  next(){
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }
  /** @param {number} min smallest @param {number} max largest @returns {number} */
  between(min, max){ return min + this.next() * (max - min); }
}

/** @param {string} text level name or law @returns {number} deterministic seed */
export function seedFromText(text){
  let seed = 613;
  for(const ch of text) seed = ((seed * 33) ^ ch.charCodeAt(0)) >>> 0;
  return seed || 770;
}
