// B"H
import { coinKind } from '../systems/currency.js';
import { enemyMask } from '../systems/enemyArchetypes.js';
import { visibleBodiesInto, visiblePointsInto } from '../systems/renderCulling.js';
import { DeathBurstRenderer } from '../render/deathBurstRenderer.js';
import { PlayerRenderer } from '../render/playerRenderer.js';
import { CanvasViewport } from './viewport.js';
import { CameraRig } from './cameraRig.js';

/**
 * Renderer paints the visible lie with reusable buckets and optional webcam.
 *
 * The Awtsmoos can place a live circular camera buffer above the player's head,
 * but only if the WebcamBubble was explicitly enabled by user action. The video
 * never changes physics, never asks for audio, and remains clipped inside the
 * canvas as a small crown-window over the moving vessel.
 */
export class Renderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.viewport = new CanvasViewport(canvas);
    this.rig = new CameraRig();
    this.webcam = options.webcam || null;
    this.view = { width: 960, height: 540 };
    this.camera = { x: 0, y: 0 };
    this.metrics = { drawn: 0, total: 0 };
    this.frame = 0;
    this.deathBursts = new DeathBurstRenderer();
    this.playerRenderer = new PlayerRenderer();
    this.buckets = { platforms: [], tricks: [], ghosts: [], rotors: [], warnings: [], active: [], enemies: [], coins: [], fakeCoins: [], trickCoins: [], keys: [] };
    this.stars = Array.from({ length: 48 }, (_, i) => ({ x: (i * 83) % 1200, y: (i * 47) % 420, s: i % 6 === 0 ? 2 : 1 }));
  }

  /** @param {object} world active physics world */
  draw(world) {
    const c = this.ctx;
    if (!c || !world?.player) return;
    this.frame += 1;
    const synced = this.viewport.sync(c);
    this.view.width = synced.width;
    this.view.height = synced.height;
    this.camera = this.rig.update(world, this.view);
    this.background(c);
    this.hudText(c, world);
    c.save();
    c.translate(-this.camera.x, -this.camera.y);
    const view = this.collectView(world);
    this.updateMetrics(world, view);
    for (const p of view.platforms) this.rect(c, p, '#3b2a66', '#9df7ff');
    for (const p of view.tricks) this.trick(c, p);
    for (const p of view.ghosts) this.ghost(c, p);
    for (const p of view.rotors) this.rotor(c, p);
    for (const s of view.warnings) this.spike(c, s, '#56eaff77', '#bffcff');
    for (const s of view.active) this.spike(c, s, '#ff2f6d', '#ffe28a');
    this.door(c, world.level.door, world.canExit?.(), world);
    this.drawPickups(c, view);
    for (const e of view.enemies) this.enemy(c, e);
    if (!world.deathPause) {
      this.hero(c, world.player);
      this.webcamBubble(c, world.player);
    }
    this.deathBursts.draw(c, world.deathBursts || []);
    c.restore();
    if (world.deathPause) this.deathPrompt(c, world);
  }

  /** @param {object} world active world @returns {object} reusable visible buckets */
  collectView(world) {
    const x = this.camera.x;
    const width = this.view.width;
    const b = this.buckets;
    visibleBodiesInto(world.level.platforms || [], x, width, b.platforms);
    visibleBodiesInto(world.tricks.visualBodies ? world.tricks.visualBodies() : world.tricks.bodies(), x, width, b.tricks);
    visibleBodiesInto(world.tricks.hazardBodies ? world.tricks.hazardBodies() : [], x, width, b.ghosts);
    visibleBodiesInto(world.rotors.bodies(), x, width, b.rotors);
    this.mergeVisibleHazards(world, x, width, b.warnings, false);
    this.mergeVisibleHazards(world, x, width, b.active, true);
    visibleBodiesInto(world.enemies || [], x, width, b.enemies);
    visiblePointsInto(world.coins || [], x, width, b.coins);
    visiblePointsInto(world.fakeCoins || [], x, width, b.fakeCoins);
    visiblePointsInto(world.trickCoins?.coins || [], x, width, b.trickCoins);
    visiblePointsInto(world.keys || [], x, width, b.keys);
    b.totalDrawn = b.platforms.length + b.tricks.length + b.ghosts.length + b.rotors.length + b.warnings.length + b.active.length + b.enemies.length + b.coins.length + b.fakeCoins.length + b.trickCoins.length + b.keys.length + 2;
    return b;
  }

  /** @param {object} world world @param {object} view visible buckets */
  updateMetrics(world, view) {
    this.metrics.drawn = view.totalDrawn;
    this.metrics.total = (world.performance?.totalPlatforms || 0) + view.enemies.length + view.coins.length + view.fakeCoins.length + view.trickCoins.length + view.keys.length + (world.spikes?.traps?.length || 0) + 2;
    world.renderMetrics = this.metrics;
  }

  /** @param {CanvasRenderingContext2D} c context @param {object} view visible buckets */
  drawPickups(c, view) {
    for (const coin of view.coins) { const k = coinKind(coin); this.spark(c, coin.x, coin.y, k.color, k.label, false, k.kind); }
    for (const coin of view.fakeCoins) this.fakeCoinThatLooksReal(c, coin);
    for (const coin of view.trickCoins) this.trickCoin(c, coin);
    for (const key of view.keys) this.spark(c, key.x, key.y, '#9df7ff', '⚿', false, 'key');
  }

  /** @param {object} world world @param {number} x camera @param {number} width view @param {Array<object>} out reusable @param {boolean} active active hazards */
  mergeVisibleHazards(world, x, width, out, active) {
    out.length = 0;
    const left = x - 140;
    const right = x + width + 140;
    const lists = active ? [world.spikes.active(), world.momentumCurse?.active?.() || []] : [world.spikes.warning(), world.momentumCurse?.warning?.() || []];
    for (const list of lists) for (const item of list) if (item.x + item.w >= left && item.x <= right) out.push(item);
  }

  background(c) {
    const { width, height } = this.view;
    c.clearRect(0, 0, width, height);
    const g = c.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#24114f'); g.addColorStop(0.55, '#130727'); g.addColorStop(1, '#06020d');
    c.fillStyle = g; c.fillRect(0, 0, width, height);
    c.fillStyle = '#ffffff22';
    const driftX = (this.camera.x * 0.08) % 1200;
    const driftY = (this.camera.y * 0.06) % 420;
    for (const star of this.stars) c.fillRect((star.x - driftX + width) % width, (star.y - driftY + height) % height, star.s, star.s);
  }

  hudText(c, w) {
    const compact = this.view.width < 560;
    c.save();
    c.fillStyle = '#fff7ff';
    c.shadowColor = '#000';
    c.shadowBlur = 6;
    c.font = `900 ${compact ? 12 : 15}px system-ui, sans-serif`;
    c.fillText(w.message || w.level?.law || '', 18, compact ? 96 : 112, Math.max(280, this.view.width - 36));
    c.restore();
  }

  rect(c, r, fill, stroke) { c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(r.x, r.y, r.w, r.h); c.strokeRect(r.x, r.y, r.w, r.h); }
  rotor(c, r) { c.save(); c.translate(r.x + r.w / 2, r.y + r.h / 2); c.rotate((r.tilt || 0) * 0.32); this.rect(c, { x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h }, '#255272', '#ffe28a'); c.restore(); }

  trick(c, r) {
    if (['falseSpike', 'phantom', 'commitDrop', 'fakeCheckpoint'].includes(r.warn)) { this.regularLookingLie(c, r); return; }
    if (r.warn === 'ice') { this.rect(c, r, '#194b70', '#bffcff'); c.fillStyle = '#d7ffff88'; for (let x = r.x + 8; x < r.x + r.w - 8; x += 16) c.fillRect(x, r.y + 4, 8, 2); return; }
    if (r.warn === 'oneWay') { this.rect(c, r, '#233f68', '#9df7ff'); c.fillStyle = '#9df7ff99'; for (let x = r.x + 8; x < r.x + r.w - 8; x += 20) c.fillRect(x, r.y + r.h - 3, 10, 2); return; }
    if (r.warn === 'booster' || r.warn === 'reverseBooster') { this.booster(c, r, r.warn === 'reverseBooster'); return; }
    const fill = r.warn === 'shatter' ? '#5b3c63' : r.warn === 'vanish' ? '#285263' : '#4b3678';
    this.rect(c, r, fill, '#d7fffb');
    if (r.warn === 'shatter') { c.fillStyle = '#ffffffaa'; c.fillRect(r.x + 8, r.y + 5, r.w - 16, 2); }
    if (r.warn === 'ambush') { c.fillStyle = '#ffffffaa'; c.font = '14px serif'; c.fillText('?', r.x + r.w / 2 - 4, r.y + 16); }
  }

  regularLookingLie(c, r) { this.rect(c, r, '#3b2a66', '#9df7ff'); if (r.warn === 'phantom') { c.fillStyle = '#ffffff18'; c.fillRect(r.x + 5, r.y + 4, r.w - 10, 2); } }

  booster(c, r, reversed) {
    this.rect(c, r, '#5f2a7d', '#ffd36a');
    c.fillStyle = '#ffd36a';
    const dir = reversed ? -(r.dir || 1) : (r.dir || 1);
    c.beginPath();
    if (dir > 0) { c.moveTo(r.x + r.w - 18, r.y + 4); c.lineTo(r.x + r.w - 6, r.y + r.h / 2); c.lineTo(r.x + r.w - 18, r.y + r.h - 4); }
    else { c.moveTo(r.x + 18, r.y + 4); c.lineTo(r.x + 6, r.y + r.h / 2); c.lineTo(r.x + 18, r.y + r.h - 4); }
    c.closePath(); c.fill();
  }

  ghost(c, r) { c.save(); c.globalAlpha = 0.22; this.rect(c, r, '#3b2a66', '#9df7ff'); c.restore(); }
  hero(c, p) { this.playerRenderer.draw(c, p, this.frame); }

  /** @param {CanvasRenderingContext2D} c context @param {object} p player */
  webcamBubble(c, p) {
    const frame = this.webcam?.frame?.();
    if (!frame) return;
    const cx = p.x + p.w / 2;
    const cy = p.y - 18;
    const r = 22;
    c.save();
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.clip();
    c.drawImage(frame, cx - r, cy - r, r * 2, r * 2);
    c.restore();
    c.save();
    c.strokeStyle = '#9df7ff';
    c.lineWidth = 2;
    c.shadowColor = '#9df7ff';
    c.shadowBlur = 10;
    c.beginPath();
    c.arc(cx, cy, r + 1, 0, Math.PI * 2);
    c.stroke();
    c.restore();
  }

  enemy(c, e) {
    const m = enemyMask(e);
    this.rect(c, e, m.color, '#ff6ad5');
    c.fillStyle = m.eye;
    c.fillRect(e.x + 7, e.y + 8, 6, 6);
    c.fillRect(e.x + Math.max(14, e.w - 13), e.y + 8, 6, 6);
    if (e.dropCoin) this.spark(c, e.x + e.w / 2 - 12, e.y - 28, '#ffd36a', '₪', false, 'coin');
    if (m.armored) { c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(e.x + 4, e.y + 4); c.lineTo(e.x + e.w - 4, e.y + e.h - 4); c.stroke(); }
    if (m.chaser) { c.fillStyle = '#ff2f6d'; c.fillText('!', e.x + e.w / 2 - 3, e.y - 4); }
  }

  spike(c, s, fill, stroke) {
    c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 2; c.beginPath();
    const teeth = Math.max(2, Math.floor(s.w / 18));
    c.moveTo(s.x, s.y + s.h);
    for (let i = 0; i < teeth; i += 1) { const x = s.x + i * s.w / teeth; c.lineTo(x + s.w / teeth / 2, s.y); c.lineTo(x + s.w / teeth, s.y + s.h); }
    c.closePath(); c.fill(); c.stroke();
  }

  spark(c, x, y, fill, label, cursed, kind = 'coin') {
    c.save(); c.shadowColor = cursed ? '#ff2f6d' : fill; c.shadowBlur = kind === 'maneh' ? 14 : 8;
    c.beginPath(); c.arc(x + 13, y + 13, kind === 'maneh' ? 15 : 13, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
    c.shadowBlur = 0; c.lineWidth = kind === 'maneh' ? 3 : 2; c.strokeStyle = cursed ? '#ff2f6d' : '#fff7ff'; c.stroke();
    c.fillStyle = '#14081f'; c.font = kind === 'key' ? '20px serif' : '18px serif'; c.textAlign = 'center'; c.fillText(label, x + 13, y + 19); c.textAlign = 'start'; c.restore();
  }

  fakeCoinThatLooksReal(c, coin) { const kind = coinKind(coin); this.spark(c, coin.x, coin.y, kind.color, kind.label, false, kind.kind); c.fillStyle = '#ffffff33'; c.fillRect(coin.x + 8, coin.y + 3, 10, 2); }

  trickCoin(c, coin) {
    const fake = coin.kind === 'revealedSpike' || coin.kind === 'fakeRunner';
    const flee = ['runner', 'panicRunner', 'iceRunner', 'reverseRunner', 'trapBait', 'shyVanish'].includes(coin.kind);
    this.spark(c, coin.x, coin.y, fake ? '#ff2f6d' : '#ffe28a', fake ? '!' : '₪', fake, fake ? 'fake' : 'coin');
    if (flee) { c.strokeStyle = '#9df7ff'; c.beginPath(); c.moveTo(coin.x + 6, coin.y + 6); c.lineTo(coin.x - 8, coin.y + 13); c.lineTo(coin.x + 6, coin.y + 20); c.stroke(); }
  }

  door(c, d, open, world) {
    this.rect(c, d, open ? '#1e816f' : '#65438c', open ? '#9df7ff' : '#ffd36a');
    c.fillStyle = '#fff'; c.font = '16px system-ui';
    const need = world && !open ? `${world.realCoinsCollected || 0}/${world.realCoinTotal || 0}` : 'OPEN';
    c.fillText(open ? 'OPEN' : need, d.x - 2, d.y - 8);
  }

  deathPrompt(c, world) {
    const pause = world.deathPause;
    const alpha = Math.max(0, Math.min(1, pause?.promptAlpha || 0));
    if (!alpha) return;
    const { width, height } = this.view;
    const panelW = Math.min(720, width - 32);
    const panelH = Math.min(270, height - 120);
    const x = (width - panelW) / 2;
    const y = Math.max(90, (height - panelH) / 2);
    c.save(); c.globalAlpha = alpha;
    c.fillStyle = '#090214dd'; c.fillRect(x, y, panelW, panelH);
    c.strokeStyle = '#9df7ff'; c.lineWidth = 2; c.strokeRect(x + 10, y + 10, panelW - 20, panelH - 20);
    c.textAlign = 'center'; c.fillStyle = '#ffd36a'; c.font = `${width < 560 ? 32 : 42}px serif`; c.fillText('ש ב י ר ה', width / 2, y + 64);
    c.fillStyle = '#fff7ff'; c.font = `${width < 560 ? 17 : 24}px system-ui, sans-serif`; c.fillText('The vessel shattered into Hebrew letters.', width / 2, y + 112, panelW - 40);
    c.font = `${width < 560 ? 13 : 17}px system-ui, sans-serif`; c.fillStyle = pause?.ready ? '#9df7ff' : '#ffffffaa';
    c.fillText(pause?.ready ? 'Press any key · tap · Jump' : 'Watch the fragments finish speaking...', width / 2, y + 158, panelW - 40);
    const loss = String(world.market?.message || '').match(/Lost (\d+)/)?.[1];
    if (loss) { c.fillStyle = '#ff6ad5'; c.font = '900 30px system-ui, sans-serif'; c.fillText('-' + loss + ' Shefa', width / 2, y + 202); }
    c.font = '13px system-ui, sans-serif'; c.fillStyle = '#ffffff99'; c.fillText(world.market?.message || world.message || '', width / 2, y + 232, panelW - 40);
    c.textAlign = 'start'; c.restore();
  }
}
