// B"H
/**
 * Deceptive and force platforms with reusable body lists.
 *
 * The Awtsmoos hides truth in vessels: one rung is solid, one rung is only a
 * whisper, one rung waits until confidence becomes arrogance, and one rung is a
 * Doodle-Jump breath. The lie must be cruel to the player, not to memory, so
 * these APIs reuse arrays and platform objects instead of minting frame-garbage.
 */
const NON_SOLID = new Set(['ghostSpike', 'falseSpike', 'phantom']);
const HAZARDS = new Set(['ghostSpike', 'falseSpike', 'commitSpike']);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export class TrickPlatformField {
  /** @param {Array<object>} tricks hand-authored platform lies */
  constructor(tricks = []) {
    this.platforms = tricks.map((p, i) => ({
      ...p, id: i, warn: p.kind, baseX: p.x, baseY: p.y, t: 0, broken: 0,
      cooldown: p.delay || 0, armed: true, alpha: 1,
      solid: !NON_SOLID.has(p.kind), hazardous: HAZARDS.has(p.kind)
    }));
    this.solidCache = [];
    this.visualCache = [];
    this.hazardCache = [];
  }

  /** @param {number} dt seconds @param {object} player mutable player body */
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

  /** @param {object} p platform @param {number} dt seconds */
  restoreBroken(p, dt) {
    if (p.broken <= 0) return;
    p.broken -= dt;
    if (p.broken <= 0) Object.assign(p, { x: p.baseX, y: p.baseY, alpha: 1, armed: true, solid: !NON_SOLID.has(p.kind) });
  }

  /** @param {object} p platform @param {number} dt seconds @param {object} player body */
  moveAmbush(p, dt, player) {
    if (p.kind !== 'ambush') return;
    p.cooldown -= dt;
    const near = Math.abs((player.x + player.w / 2) - (p.baseX + p.w / 2)) < (p.range || 90);
    if (near && p.cooldown <= 0) { p.y = p.baseY - (p.jump || 80); p.cooldown = p.reset || 2.4; }
    else p.y += (p.baseY - p.y) * Math.min(1, dt * 5);
  }

  /** @param {object} p platform */
  applyFlicker(p) {
    if (p.kind === 'vanish') p.alpha = 0.35 + Math.abs(Math.sin(p.t * 3)) * 0.65;
    if (p.kind === 'phantom') p.alpha = 0.45 + Math.abs(Math.sin(p.t * 2)) * 0.25;
    if (p.kind === 'ghostSpike') p.alpha = 0.25 + Math.abs(Math.sin(p.t * 2.5)) * 0.25;
    if (p.kind === 'commitDrop') p.alpha = p.armed ? 1 : 0.18 + Math.abs(Math.sin(p.t * 7)) * 0.18;
    if (p.kind === 'motionOnly') p.alpha = 0.55 + Math.abs(Math.sin(p.t * 5)) * 0.35;
    if (p.kind === 'oneWay') p.alpha = 0.74 + Math.abs(Math.sin(p.t * 4)) * 0.18;
  }

  /** @param {object} p platform @param {number} dt seconds @param {object} player body */
  applyMotionRules(p, dt, player) {
    if (p.kind === 'magnet') player.vx += Math.sign((p.x + p.w / 2) - (player.x + player.w / 2)) * (p.pull || 360) * dt;
    if (p.kind === 'antiSpeed' && overlaps(player, { x: p.x, y: p.y - 24, w: p.w, h: p.h + 24 })) player.vx *= 0.82;
    if (p.kind === 'antiJump' && overlaps(player, { x: p.x, y: p.y - 14, w: p.w, h: p.h + 14 }) && player.vy < 0) player.vy *= 0.35;
  }

  /** @returns {Array<object>} reusable solid collision bodies */
  bodies() { return this.collectInto(this.solidCache, p => p.broken <= 0 && p.alpha !== 0 && p.solid); }

  /** @returns {Array<object>} reusable visual bodies including non-solid lies */
  visualBodies() { return this.collectInto(this.visualCache, p => p.broken <= 0 && p.alpha !== 0); }

  /** @returns {Array<object>} reusable hazardous ghost bodies */
  hazardBodies() { return this.collectInto(this.hazardCache, p => p.broken <= 0 && p.hazardous); }

  /** @param {Array<object>} out cache @param {(p:object)=>boolean} predicate filter */
  collectInto(out, predicate) {
    out.length = 0;
    for (const p of this.platforms) if (predicate(p)) out.push(p);
    return out;
  }

  /** @param {object} body landed body @param {object} player mutable player */
  land(body, player) {
    const p = body.id === undefined ? this.platforms.find(item => item === body) || body : (this.platforms[body.id] || body);
    if (p.kind === 'shatter' && p.armed) return this.break(p, p.reform || 2.2, 'The platform shattered like a nervous secret.');
    if (p.kind === 'vanish' && p.armed) return this.break(p, p.reform || 1.5, 'The platform blinked out of the dream.');
    if (p.kind === 'commitDrop' && p.armed) return this.break(p, p.reform || 2.8, 'The rung waited for commitment, then became absence.');
    if (p.kind === 'ambush') return 'The ordinary block jumped like it owed money.';
    if (p.kind === 'oneWay') return 'The one-way rung catches only a falling vessel.';
    if (p.kind === 'ice' && player) { player.ice = p.duration || 0.7; return 'The glass platform keeps your old direction.'; }
    if (p.kind === 'booster' && player) { player.vx = (p.dir || 1) * (p.boost || 720); player.vy -= p.lift || 0; return 'The force-rung throws you forward.'; }
    if (p.kind === 'reverseBooster' && player) { player.vx = -(p.dir || 1) * (p.boost || 760); return 'The arrow lied and hurled you backward.'; }
    if (p.kind === 'fakeCheckpoint') return 'The checkpoint symbol was just theater. Keep moving.';
    return '';
  }

  /** @param {object} p platform @param {number} reform seconds @param {string} message message */
  break(p, reform, message) {
    Object.assign(p, { armed: false, broken: reform, alpha: 0, solid: false });
    return message;
  }

  /** @param {object} player mutable player @returns {string} death message or empty */
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
