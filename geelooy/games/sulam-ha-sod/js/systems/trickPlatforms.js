// B"H
/**
 * Deceptive and force platforms.
 *
 * The Awtsmoos hides truth in vessels: one rung is solid, one rung is only a
 * whisper, one rung waits until confidence becomes arrogance. Every mechanic
 * below is deterministic and readable, because cruelty without a tell is noise.
 */
const NON_SOLID = new Set(['ghostSpike', 'falseSpike', 'phantom']);
const HAZARDS = new Set(['ghostSpike', 'falseSpike', 'commitSpike']);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class TrickPlatformField {
  constructor(tricks = []) {
    this.platforms = tricks.map((p, i) => ({
      ...p, id: i, baseX: p.x, baseY: p.y, t: 0, broken: 0, cooldown: p.delay || 0,
      armed: true, alpha: 1, solid: !NON_SOLID.has(p.kind), hazardous: HAZARDS.has(p.kind)
    }));
  }

  step(dt, player) {
    for (const p of this.platforms) {
      p.t += dt;
      this.restoreBroken(p, dt);
      if (p.broken > 0) continue;
      this.moveAmbush(p, dt, player);
      this.applyFlicker(p);
      this.applyMotionRules(p, dt, player);
    }
  }

  restoreBroken(p, dt) {
    if (p.broken <= 0) return;
    p.broken -= dt;
    if (p.broken <= 0) Object.assign(p, { x: p.baseX, y: p.baseY, alpha: 1, armed: true, solid: !NON_SOLID.has(p.kind) });
  }

  moveAmbush(p, dt, player) {
    if (p.kind !== 'ambush') return;
    p.cooldown -= dt;
    const near = Math.abs((player.x + player.w / 2) - (p.baseX + p.w / 2)) < (p.range || 90);
    if (near && p.cooldown <= 0) { p.y = p.baseY - (p.jump || 80); p.cooldown = p.reset || 2.4; }
    else p.y += (p.baseY - p.y) * Math.min(1, dt * 5);
  }

  applyFlicker(p) {
    if (p.kind === 'vanish') p.alpha = 0.35 + Math.abs(Math.sin(p.t * 3)) * 0.65;
    if (p.kind === 'phantom') p.alpha = 0.45 + Math.abs(Math.sin(p.t * 2)) * 0.25;
    if (p.kind === 'ghostSpike') p.alpha = 0.25 + Math.abs(Math.sin(p.t * 2.5)) * 0.25;
    if (p.kind === 'commitDrop') p.alpha = p.armed ? 1 : 0.18 + Math.abs(Math.sin(p.t * 7)) * 0.18;
    if (p.kind === 'motionOnly') p.alpha = 0.55 + Math.abs(Math.sin(p.t * 5)) * 0.35;
  }

  applyMotionRules(p, dt, player) {
    if (p.kind === 'magnet') player.vx += Math.sign((p.x + p.w / 2) - (player.x + player.w / 2)) * (p.pull || 360) * dt;
    if (p.kind === 'antiSpeed' && overlaps(player, { x: p.x, y: p.y - 24, w: p.w, h: p.h + 24 })) player.vx *= 0.82;
    if (p.kind === 'antiJump' && overlaps(player, { x: p.x, y: p.y - 14, w: p.w, h: p.h + 14 }) && player.vy < 0) player.vy *= 0.35;
  }

  bodies() {
    return this.platforms.filter(p => p.broken <= 0 && p.alpha !== 0 && p.solid).map(p => ({ ...p, warn: p.kind }));
  }

  visualBodies() {
    return this.platforms.filter(p => p.broken <= 0 && p.alpha !== 0).map(p => ({ ...p, warn: p.kind }));
  }

  hazardBodies() {
    return this.platforms.filter(p => p.broken <= 0 && p.hazardous).map(p => ({ x: p.x, y: p.y, w: p.w, h: p.h, kind: p.kind, id: p.id }));
  }

  land(body, player) {
    const p = this.platforms.find(item => item.id === body.id) || body;
    if (p.kind === 'shatter' && p.armed) return this.break(p, p.reform || 2.2, 'The platform shattered like a nervous secret.');
    if (p.kind === 'vanish' && p.armed) return this.break(p, p.reform || 1.5, 'The platform blinked out of the dream.');
    if (p.kind === 'commitDrop' && p.armed) return this.break(p, p.reform || 2.8, 'The rung waited for commitment, then became absence.');
    if (p.kind === 'ambush') return 'The ordinary block jumped like it owed money.';
    if (p.kind === 'ice' && player) { player.ice = p.duration || 0.7; return 'The glass platform keeps your old direction.'; }
    if (p.kind === 'booster' && player) { player.vx = (p.dir || 1) * (p.boost || 720); player.vy -= p.lift || 0; return 'The force-rung throws you forward.'; }
    if (p.kind === 'reverseBooster' && player) { player.vx = -(p.dir || 1) * (p.boost || 760); return 'The arrow lied and hurled you backward.'; }
    if (p.kind === 'fakeCheckpoint') return 'The checkpoint symbol was just theater. Keep moving.';
    return '';
  }

  break(p, reform, message) {
    Object.assign(p, { armed: false, broken: reform, alpha: 0, solid: false });
    return message;
  }

  touchGhost(player) {
    for (const p of this.platforms) {
      if (!p.hazardous || p.broken > 0) continue;
      if (!overlaps(player, p)) continue;
      p.broken = p.reform || 2;
      p.alpha = 0;
      return p.kind === 'falseSpike' ? 'The normal platform was spikes in disguise.' : 'The glowing bridge was only disguised spikes.';
    }
    return '';
  }
}
