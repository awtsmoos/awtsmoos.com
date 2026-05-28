// B"H
/**
 * TrickCoinField makes treasure behave like a liar with readable footprints.
 *
 * The Awtsmoos gives even a coin its little letter-soul: it can flee, freeze,
 * reverse, vanish, bait the player toward teeth, or confess itself as a spike.
 */
const dist = (a, b) => Math.hypot((a.x + 13) - (b.x + b.w / 2), (a.y + 13) - (b.y + b.h / 2));
const hitCoin = (a, b) => a.x < b.x + b.w && a.x + 26 > b.x && a.y < b.y + b.h && a.y + 26 > b.y;

export class TrickCoinField {
  constructor(coins = []) {
    this.coins = coins.map((c, i) => ({ ...c, id: i, baseX: c.x, baseY: c.y, vx: 0, vy: 0, t: 0, alive: true, phase: 0 }));
  }

  step(dt, world) {
    const player = world.player;
    for (const coin of this.coins) {
      if (!coin.alive) continue;
      coin.t += dt;
      this.steerCoin(coin, player, world);
      this.integrate(coin, dt);
    }
  }

  steerCoin(c, player, world) {
    const d = dist(c, player);
    const near = d < (c.trigger || 150);
    if (c.kind === 'runner' && near) c.vx = (player.x < c.x ? 1 : -1) * (c.speed || 220);
    if (c.kind === 'panicRunner') this.panic(c, near, player, world);
    if (c.kind === 'iceRunner' && near) c.vx = (c.dir || 1) * (c.speed || 360);
    if (c.kind === 'reverseRunner' && near) c.vx = (c.vx || (c.dir || 1) * (c.speed || 280)) * -1;
    if (c.kind === 'trapBait' && near) c.vx = Math.sign((c.baitX || c.baseX) - c.x) * (c.speed || 180);
    if (c.kind === 'shyVanish' && near && approachWrong(c, player)) c.alive = false;
    if (c.kind === 'fakeRunner' && d < (c.trigger || 130)) { c.kind = 'revealedSpike'; world.message = 'You were chasing a spike wearing gold.'; }
    if (!near && !['reverseRunner', 'trapBait'].includes(c.kind)) c.vx *= 0.9;
  }

  panic(c, near, player, world) {
    if (near) { c.vx = (player.x < c.x ? 1 : -1) * (c.speed || 320); c.phase = 1; }
    if (!c.phase) return;
    for (const spike of world.spikes.active()) {
      if (!hitCoin(c, spike)) continue;
      Object.assign(c, { x: c.baseX, y: c.baseY, vx: 0, phase: 0 });
      world.message = 'The terrified coin leapt into spikes and reset itself.';
    }
  }

  integrate(c, dt) {
    c.x += c.vx * dt;
    c.y += (c.vy || 0) * dt;
    if (c.min !== undefined && c.x < c.min) { c.x = c.min; c.vx = Math.abs(c.vx); }
    if (c.max !== undefined && c.x > c.max) { c.x = c.max; c.vx = -Math.abs(c.vx); }
  }

  collect(player) {
    for (let i = this.coins.length - 1; i >= 0; i -= 1) {
      const c = this.coins[i];
      if (!c.alive || c.kind === 'revealedSpike') continue;
      if (hitCoin(c, player)) return this.coins.splice(i, 1)[0];
    }
    return null;
  }

  touchFake(player) {
    return this.coins.some(c => c.kind === 'revealedSpike' && hitCoin(c, player));
  }
}

function approachWrong(coin, player) {
  const fromRight = player.x > coin.x;
  return coin.safeSide === 'left' ? fromRight : !fromRight;
}
