// B"H

/**
 * Event watcher for exact cheap pickup/death bursts.
 *
 * Chapter 17: The Awtsmoos made remembrance clean. When a new level or reset
 * arrives, old sparks do not haunt the chamber; they return to silence. Then
 * only true changes awaken hard pixels: coins, defeated enemies, living events.
 */
export class VisualEventWatcher {
  constructor(forge) { this.forge = forge; this.levelName = ''; this.lastCoins = 0; this.lastEnemies = 0; }

  /** @param {object} world Active world. */
  watch(world) {
    if (!world?.level) return;
    if (this.levelName !== world.level.name) this.reset(world);
    this.coinDelta(world);
    this.enemyDelta(world);
  }

  /** @param {object} world Active world. */
  reset(world) {
    this.levelName = world.level.name || '';
    this.lastCoins = world.realCoinsCollected || 0;
    this.lastEnemies = (world.enemies || []).length;
    this.forge.clear?.();
  }

  coinDelta(world) {
    const now = world.realCoinsCollected || 0;
    if (now <= this.lastCoins) { this.lastCoins = now; return; }
    const p = world.player || { x: 0, y: 0, w: 0, h: 0 };
    for (let i = this.lastCoins; i < now; i += 1) this.forge.burst(p.x + p.w / 2, p.y + p.h / 2, '#ffd36a', 5, '+1');
    this.lastCoins = now;
  }

  enemyDelta(world) {
    const now = (world.enemies || []).length;
    if (now >= this.lastEnemies) { this.lastEnemies = now; return; }
    const p = world.player || { x: 0, y: 0, w: 0, h: 0 };
    this.forge.burst(p.x + p.w / 2, p.y + p.h, '#ffffff', 8, '✦');
    this.lastEnemies = now;
  }
}
