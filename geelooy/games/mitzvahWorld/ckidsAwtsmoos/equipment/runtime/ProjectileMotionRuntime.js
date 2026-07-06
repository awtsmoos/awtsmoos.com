// B"H
/** @file ProjectileMotionRuntime.js @description Hebrew letters fly, tick, and impact with purification metadata. */
function add(a={}, b={}) { return { x:(a.x||0)+(b.x||0), y:(a.y||0)+(b.y||0), z:(a.z||0)+(b.z||0) }; }
function scale(v={}, s=1) { return { x:(v.x||0)*s, y:(v.y||0)*s, z:(v.z||0)*s }; }
export class ProjectileMotionRuntime {
  constructor(runtime) { this.runtime = runtime; this.active = new Map(); }
  launch(projectile) { const moving = { ...projectile, position:{ ...(projectile.origin || {}) }, velocity:scale(projectile.direction || { z:1 }, 12 * (projectile.power || 1)), age:0, impacted:false }; this.active.set(moving.id, moving); this.runtime?.registerEntity?.(moving); return moving; }
  tick(dt = 1/60) { const impacts = []; for (const p of this.active.values()) { p.age += dt; p.position = add(p.position, scale(p.velocity, dt)); if (p.age > 2.5 || p.position.z > 30) impacts.push(this.impact(p.id, { reason:"range-limit" })); else this.runtime?.registerEntity?.(p); } return impacts.filter(Boolean); }
  impact(id, data = {}) { const p = this.active.get(id); if (!p) return null; this.active.delete(id); const impact = { ...p, impacted:true, impactAt:Date.now(), impactData:data, effect:"purify-klipah-region" }; this.runtime?.registerEntity?.({ ...impact, kind:"projectileImpact", tags:["projectileImpact","purification",p.letter] }); return impact; }
  snapshot() { return { active:this.active.size, projectiles:[...this.active.values()] }; }
}
export function createProjectileMotionRuntime(runtime) { return new ProjectileMotionRuntime(runtime); }
export default createProjectileMotionRuntime;
