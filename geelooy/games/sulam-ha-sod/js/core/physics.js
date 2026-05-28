// B"H
import { collectCurrency } from '../systems/currency.js';
import { SpikeOracle } from '../systems/spikes.js';
import { enemyMask, steerEnemy } from '../systems/enemyArchetypes.js';
import { RotatingPlatformField } from '../systems/rotatingPlatforms.js';
import { TrickPlatformField } from '../systems/trickPlatforms.js';
import { LevelTriggerField } from '../systems/levelTriggers.js';
import { SpatialHash } from '../systems/spatialHash.js';
import { SacredRandom, seedFromText } from '../systems/sacredRandom.js';
import { equippedSkin } from '../systems/market.js';
import { TrickCoinField } from '../systems/trickCoins.js';
import { MomentumCurse } from '../systems/momentumCurse.js';
import { spawnHebrewShatter, stepBursts } from '../systems/deathBursts.js';
import { calculateDeathPenalty, deathPenaltyReceipt } from '../systems/deathPenalty.js';

const GRAVITY = 1700;
const SPEED = 280;
const JUMP = -680;
const SHATTER_ONLY_TIME = 1.15;
const CONTINUE_READY_TIME = 1.75;
const clone = value => JSON.parse(JSON.stringify(value));
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * PhysicsWorld is the living chamber of Sulam HaSod.
 *
 * The Awtsmoos speaks letters into the level every frame. Every Shefa spark
 * collected during a run now becomes part of the death bill: the player loses
 * at least that run's gathered value, plus a progress and difficulty tax.
 */
export class PhysicsWorld {
  constructor(level) {
    this.soundEvents = [];
    this.visibleCameraX = 0;
    this.visibleCameraY = 0;
    this.cameraResetAfterDeath = false;
    this.load(level);
  }

  load(level) {
    const oldCurrency = this.currency || { perutah: 0, dinar: 0, sela: 0, maneh: 0, shefa: 0, chain: 0, bestChain: 0 };
    const oldMarket = this.market || { owned: ['plain'], equipped: 'plain', open: false, message: level.law || 'Find the key, read the floor, reach the gate.' };
    const oldDeathBursts = this.deathBursts || [];
    const oldDeathPause = this.deathPause || null;
    const oldVisibleCameraX = this.visibleCameraX || 0;
    const oldVisibleCameraY = this.visibleCameraY || 0;
    const oldCameraResetAfterDeath = this.cameraResetAfterDeath || false;
    this.level = clone(level);
    this.width = level.width || 960;
    this.rng = new SacredRandom(seedFromText(`${level.name}${level.law}`));
    this.player = { ...level.spawn, w: 34, h: 48, vx: 0, vy: 0, on: false, ice: 0, stomps: 0, skin: equippedSkin(oldMarket) };
    this.coins = clone(level.coins || []);
    this.enemyCoinTotal = (level.enemies || []).filter(enemy => enemy.dropCoin).length;
    this.realCoinTotal = this.coins.length + this.enemyCoinTotal;
    this.realCoinsCollected = 0;
    this.runShefaCollected = 0;
    this.fakeCoins = clone(level.fakeCoins || []);
    this.keys = clone(level.keys || []);
    this.enemies = clone(level.enemies || []);
    this.trickCoins = new TrickCoinField(level.trickCoins || []);
    this.momentumCurse = new MomentumCurse();
    this.deathBursts = oldDeathBursts;
    this.deathPause = oldDeathPause;
    this.cameraResetAfterDeath = oldCameraResetAfterDeath;
    this.visibleCameraX = oldDeathPause?.cameraX ?? oldVisibleCameraX;
    this.visibleCameraY = oldDeathPause?.cameraY ?? oldVisibleCameraY;
    this.currency = oldCurrency;
    this.market = oldMarket;
    this.rotors = new RotatingPlatformField(level.rotatingPlatforms || []);
    this.tricks = new TrickPlatformField(level.trickPlatforms || []);
    this.triggers = new LevelTriggerField(level.triggers || []);
    this.spikes = new SpikeOracle(level.spikes || [], this.rng);
    this.spatial = new SpatialHash(180);
    this.enemySpatial = new SpatialHash(220);
    this.keyCount = 0;
    this.score = this.currency.shefa || 0;
    this.performance = { platformChecks: 0, enemyChecks: 0, totalPlatforms: 0, totalEnemies: 0, difficulty: this.difficulty() };
    this.message = oldDeathPause ? oldDeathPause.reason : level.law || 'Find the key, read the floor, reach the gate.';
    this.reindex();
  }

  difficulty() {
    const level = this.level || {};
    const pressure = (level.spikes?.length || 0) + (level.rotatingPlatforms?.length || 0) + (level.trickPlatforms?.length || 0) + (level.enemies?.length || 0) + (level.triggers?.length || 0);
    return 1 + Math.floor(pressure / 5);
  }

  step(input, dt) {
    if (input.restart && !this.deathPause) this.load(this.level);
    if (this.deathPause) return this.stepDeathPause(dt);
    this.deathBursts = stepBursts(this.deathBursts, dt);
    this.moveEnemies(dt);
    this.trickCoins.step(dt, this);
    this.rotors.step(dt);
    this.tricks.step(dt, this.player);
    this.spikes.step(dt, this.player);
    this.momentumCurse.step(dt, input, this.player, this.rng);
    this.reindex();
    const oldY = this.player.y;
    this.applyHorizontalInput(input, dt);
    this.jumpIfAllowed(input);
    this.applyGravity(dt);
    this.moveAndResolve(dt);
    this.collectStaticCoins();
    this.collectTrickCoins();
    this.touchFakeCoins();
    this.collectKeys();
    this.triggers.step(this);
    if (this.touchEnemy(oldY)) return 'deadPause';
    if (this.touchSpike()) return 'deadPause';
    if (this.player.y > 660) { this.loseMoneyAndReset('The abyss charged a brutal fall fee.'); return 'deadPause'; }
    if (this.canExit() && hit(this.player, this.level.door)) return 'next';
    if (this.keyCount && !this.allRealCoinsCollected() && hit(this.player, this.level.door)) this.message = `The door wants every real coin: ${this.realCoinsCollected}/${this.realCoinTotal}.`;
    return 'play';
  }

  canExit() { return this.keyCount > 0 && this.allRealCoinsCollected(); }
  allRealCoinsCollected() { return this.realCoinsCollected >= this.realCoinTotal; }

  stepDeathPause(dt) {
    this.deathBursts = stepBursts(this.deathBursts, dt);
    this.deathPause.t += dt;
    this.deathPause.promptAlpha = Math.max(0, Math.min(1, (this.deathPause.t - SHATTER_ONLY_TIME) / 0.65));
    this.deathPause.ready = this.deathPause.t >= CONTINUE_READY_TIME;
    this.message = this.deathPause.ready ? 'Press any key, tap, or Jump to continue.' : this.deathPause.reason;
    return 'deadPause';
  }

  continueAfterDeath() {
    if (!this.deathPause || !this.deathPause.ready) return false;
    this.deathPause = null;
    this.cameraResetAfterDeath = true;
    this.visibleCameraY = 0;
    this.message = this.level.law || 'Read the floor again.';
    this.queueSound('continue');
    return true;
  }

  applyHorizontalInput(input, dt) {
    const p = this.player;
    if (p.ice > 0) { p.ice -= dt; p.vx = input.x * 70 + p.vx * 0.965; }
    else p.vx = input.x * SPEED + p.vx * 0.08;
  }

  jumpIfAllowed(input) {
    if (input.jump && this.player.on) { this.player.vy = JUMP; this.player.on = false; this.queueSound('jump'); }
  }

  applyGravity(dt) { this.player.vy += GRAVITY * dt; }
  moveAndResolve(dt) { this.player.x += this.player.vx * dt; this.resolve('x'); this.player.y += this.player.vy * dt; this.resolve('y'); }

  reindex() {
    const platforms = [...(this.level.platforms || []), ...this.rotors.bodies(), ...this.tricks.bodies()];
    this.performance.totalPlatforms = platforms.length;
    this.performance.totalEnemies = this.enemies.length;
    this.performance.platformChecks = 0;
    this.performance.enemyChecks = 0;
    this.spatial.build(platforms);
    this.enemySpatial.build(this.enemies);
  }

  resolve(axis) {
    const p = this.player;
    if (axis === 'y') p.on = false;
    const nearby = this.spatial.query({ x: p.x - 8, y: p.y - 8, w: p.w + 16, h: p.h + 16 });
    this.performance.platformChecks += nearby.length;
    for (const body of nearby) {
      if (!hit(p, body)) continue;
      if (axis === 'x') { p.x = p.vx > 0 ? body.x - p.w : body.x + body.w; continue; }
      p.y = p.vy > 0 ? body.y - p.h : body.y + body.h;
      p.on = p.vy > 0;
      p.vy = 0;
      if (body.tilt) this.rotors.throwIfCruel(p, body);
      if (body.warn && p.on) { const message = this.tricks.land(body, p); if (message) this.message = message; this.reindex(); }
    }
    p.x = Math.max(0, Math.min(this.width - p.w, p.x));
  }

  collectStaticCoins() {
    this.collect(this.coins, 26, coin => {
      const kind = collectCurrency(this.currency, coin);
      this.runShefaCollected += kind.value;
      this.realCoinsCollected += 1;
      this.score = this.currency.shefa;
      this.message = `${kind.kind} joins the chain. Coins ${this.realCoinsCollected}/${this.realCoinTotal}.`;
      this.queueSound('coin');
    });
  }

  collectTrickCoins() {
    const coin = this.trickCoins.collect(this.player);
    if (coin) {
      const kind = collectCurrency(this.currency, coin);
      this.runShefaCollected += kind.value;
      this.score = this.currency.shefa;
      this.message = `The fleeing ${kind.kind} finally surrendered.`;
      this.queueSound('coin');
    }
    if (this.trickCoins.touchFake(this.player)) this.loseMoneyAndReset('The fleeing treasure was a spike all along.');
  }

  collectKeys() { this.collect(this.keys, 28, () => { this.keyCount += 1; this.message = this.allRealCoinsCollected() ? 'The key remembers the door.' : `The key waits for every real coin: ${this.realCoinsCollected}/${this.realCoinTotal}.`; this.queueSound('key'); }); }

  touchEnemy(oldY) {
    const p = this.player;
    const nearby = this.enemySpatial.query({ x: p.x - 16, y: p.y - 16, w: p.w + 32, h: p.h + 32 });
    this.performance.enemyChecks += nearby.length;
    for (const enemy of nearby) {
      if (!hit(p, enemy)) continue;
      const index = this.enemies.indexOf(enemy);
      const mask = enemyMask(enemy);
      const wasAbove = oldY + p.h <= enemy.y + 10 && p.vy >= 0;
      if (wasAbove) {
        if (mask.stompable === false) { this.loseMoneyAndReset(`${enemy.name || 'armored enemy'} punished the stomp.`); return true; }
        this.enemyStomp(index, enemy, mask); return true;
      }
      this.loseMoneyAndReset(`${enemy.name || 'husk'} collected a cruelty tax.`); return true;
    }
    return false;
  }

  enemyStomp(index, enemy, mask) {
    if (index >= 0) this.enemies.splice(index, 1);
    this.player.vy = JUMP * 0.58;
    this.player.stomps += 1;
    if (enemy.dropCoin) this.dropEnemyCoin(enemy);
    if (mask.revives) this.enemies.push({ ...enemy, dropCoin: null, type: 'husk', w: 24, h: 24, y: enemy.y + 8, vx: -enemy.vx * 0.8, name: 'gilgul echo' });
    this.message = enemy.dropCoin ? `${enemy.name || 'carrier'} dropped a required coin.` : `${enemy.name || 'husk'} ${mask.stomp}.`;
    this.queueSound('jump');
    this.reindex();
  }

  dropEnemyCoin(enemy) {
    this.coins.push({ x: enemy.x + enemy.w / 2 - 13, y: Math.max(40, enemy.y - 30), kind: enemy.dropCoin });
    this.queueSound('key');
  }

  touchSpike() {
    for (const spike of [...this.spikes.active(), ...this.momentumCurse.active()]) {
      if (hit(this.player, spike)) { this.loseMoneyAndReset('Spikes burst: Shefa spilled into the floor.'); return true; }
    }
    const ghostMessage = this.tricks.touchGhost?.(this.player);
    if (ghostMessage) { this.loseMoneyAndReset(ghostMessage); return true; }
    return false;
  }

  touchFakeCoins() {
    for (let i = this.fakeCoins.length - 1; i >= 0; i -= 1) {
      const coin = this.fakeCoins[i];
      if (!hit(this.player, { x: coin.x, y: coin.y, w: 26, h: 26 })) continue;
      this.fakeCoins.splice(i, 1);
      this.loseMoneyAndReset(coin.message || 'The coin was a spike wearing gold.');
      return true;
    }
    return false;
  }

  runProgress() {
    return Math.max(0, Math.min(1, this.player.x / Math.max(1, this.width - this.player.w)));
  }

  deathLoss() {
    return calculateDeathPenalty({
      shefa: this.currency.shefa || 0,
      runShefa: this.runShefaCollected || 0,
      progress: this.runProgress(),
      difficulty: this.performance?.difficulty || this.difficulty()
    });
  }

  loseMoneyAndReset(reason) {
    const dead = { ...this.player };
    const progress = this.runProgress();
    const runShefa = this.runShefaCollected || 0;
    const lockCameraX = Number.isFinite(this.visibleCameraX) ? this.visibleCameraX : Math.max(0, dead.x - 430);
    const lockCameraY = Number.isFinite(this.visibleCameraY) ? this.visibleCameraY : dead.y - 360;
    this.deathBursts.push(spawnHebrewShatter(dead, reason, this.rng));
    this.deathPause = { reason, t: 0, ready: false, promptAlpha: 0, deathX: dead.x, deathY: dead.y, cameraX: lockCameraX, cameraY: lockCameraY };
    const loss = this.deathLoss();
    this.currency.shefa = Math.max(0, (this.currency.shefa || 0) - loss);
    this.currency.chain = 0;
    this.market.message = `${reason} ${deathPenaltyReceipt(loss, runShefa, progress)}`;
    this.queueSound('death');
    this.load(this.level);
  }

  collect(list, size, onCollect) {
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const item = list[i];
      if (!hit(this.player, { x: item.x, y: item.y, w: size, h: size })) continue;
      list.splice(i, 1);
      onCollect(item);
    }
  }

  moveEnemies(dt) {
    for (const enemy of this.enemies) {
      steerEnemy(enemy, this.player, dt);
      enemy.x += enemy.vx * dt;
      if (enemy.x < enemy.min || enemy.x > enemy.max) { enemy.vx *= -1; enemy.x = Math.max(enemy.min, Math.min(enemy.max, enemy.x)); }
    }
  }

  drainSoundEvents() { const events = this.soundEvents; this.soundEvents = []; return events; }
  queueSound(name) { this.soundEvents.push(name); }
}
