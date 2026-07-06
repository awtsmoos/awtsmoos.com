// B"H
/** @file HebrewLetterProjectileRuntime.js @description Arrows become glowing letters that refine instead of merely damage. */
const LETTERS = ["א","ב","ג","ד","ה","ו","ז","ח","ט","י","כ","ל","מ","נ","ס","ע","פ","צ","ק","ר","ש","ת"];
export class HebrewLetterProjectileRuntime {
  constructor(runtime) { this.runtime = runtime; this.projectiles = []; this.index = 0; }
  nextLetter() { const letter = LETTERS[this.index % LETTERS.length]; this.index += 1; return letter; }
  fire({ actorId, origin = { x:0, y:1.4, z:0 }, direction = { x:0, y:.03, z:1 }, itemId = "hebrewBow", power = 1 } = {}) {
    const letter = this.nextLetter(), id = `hebrewProjectile_${Date.now()}_${this.index}`;
    const projectile = { id, kind:"projectile", tags:["hebrew-letter","purification","ranged"], actorId, itemId, letter, origin, direction, power, glow:true, trail:"letter-spark", impact:"purify-klipah" };
    this.projectiles.push(projectile); this.projectiles = this.projectiles.slice(-120); this.runtime?.registerEntity?.(projectile); return projectile;
  }
  snapshot() { return { count:this.projectiles.length, last:this.projectiles.at(-1) || null }; }
}
export function createHebrewLetterProjectileRuntime(runtime) { return new HebrewLetterProjectileRuntime(runtime); }
export default createHebrewLetterProjectileRuntime;
