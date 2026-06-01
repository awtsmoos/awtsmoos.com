// B"H
import { coinKind } from '../systems/currency.js';
import { enemyMask } from '../systems/enemyArchetypes.js';
import { visibleBodiesInto, visiblePointsInto } from '../systems/renderCulling.js';
import { DeathBurstRenderer } from '../render/deathBurstRenderer.js';
import { PlayerRenderer } from '../render/playerRenderer.js';
import { coinFace, falseSlab, slab } from '../render/skin/shapePrayers.js';
import { themeOf, themeSkin } from '../render/skin/worldTheme.js';
import { CanvasViewport } from './viewport.js';
import { CameraRig } from './cameraRig.js';

/**
 * Complete hard-shape renderer for Sulam HaSod.
 *
 * Chapter 15: The Awtsmoos entered the frame and made every vessel confess its
 * role. Real stones carry weight. Lies carry broken grammar. Coins wear Hebrew.
 * Rotors show axles. Spikes speak dormant, warning, active. The canvas remains
 * one fast 2D court: no images, no glow, no blur, only readable geometry.
 */
export class Renderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
    this.viewport = new CanvasViewport(canvas); this.rig = new CameraRig(); this.webcam = options.webcam || null;
    this.view = { width: 960, height: 540 }; this.camera = { x: 0, y: 0 }; this.frame = 0;
    this.metrics = { drawn: 0, total: 0 }; this.deathBursts = new DeathBurstRenderer(); this.playerRenderer = new PlayerRenderer();
    this.safeSpikeBox = { x: 0, y: 0, w: 0, h: 0 };
    this.buckets = { platforms: [], tricks: [], ghosts: [], rotors: [], dormant: [], warnings: [], active: [], enemies: [], coins: [], fakeCoins: [], trickCoins: [], keys: [] };
  }

  draw(world) {
    const c = this.ctx; if (!c || !world?.player) return;
    this.frame += 1; const synced = this.viewport.sync(c); this.view.width = synced.width; this.view.height = synced.height;
    this.camera = this.rig.update(world, this.view); this.background(c); this.hudText(c, world);
    c.save(); c.translate(-this.camera.x, -this.camera.y);
    const view = this.collectView(world); this.updateMetrics(world, view); const theme = themeOf(world), skin = themeSkin(theme);
    for (const p of view.platforms) this.platform(c, p, skin);
    for (const p of view.tricks) this.trick(c, p, skin);
    for (const p of view.ghosts) this.ghost(c, p, skin);
    for (const p of view.rotors) this.rotor(c, p, skin);
    for (const s of view.dormant) this.spike(c, s, '#151016', skin.bottom, 0.45);
    for (const s of view.warnings) this.spike(c, s, '#315a68', skin.trim, 0.82);
    for (const s of view.active) this.spike(c, s, '#8d1430', '#ffe28a', 1);
    this.door(c, world.level.door, world.canExit?.(), world, skin); this.drawPickups(c, view);
    for (const e of view.enemies) this.enemy(c, e, theme);
    if (!world.deathPause) { this.hero(c, world.player); this.webcamBubble(c, world.player); }
    this.deathBursts.draw(c, world.deathBursts || []); c.restore();
    if (world.deathPause) this.deathPrompt(c, world);
  }

  collectView(world) {
    const x = this.camera.x, width = this.view.width, b = this.buckets;
    visibleBodiesInto(world.level.platforms || [], x, width, b.platforms);
    visibleBodiesInto(world.tricks.visualBodies ? world.tricks.visualBodies() : world.tricks.bodies(), x, width, b.tricks);
    visibleBodiesInto(world.tricks.hazardBodies ? world.tricks.hazardBodies() : [], x, width, b.ghosts);
    visibleBodiesInto(world.rotors.bodies(), x, width, b.rotors);
    this.mergeVisibleHazards(world, x, width, b.dormant, 'dormant'); this.mergeVisibleHazards(world, x, width, b.warnings, 'warning'); this.mergeVisibleHazards(world, x, width, b.active, 'active');
    visibleBodiesInto(world.enemies || [], x, width, b.enemies); visiblePointsInto(world.coins || [], x, width, b.coins);
    visiblePointsInto(world.fakeCoins || [], x, width, b.fakeCoins); visiblePointsInto(world.trickCoins?.coins || [], x, width, b.trickCoins); visiblePointsInto(world.keys || [], x, width, b.keys);
    b.totalDrawn = b.platforms.length + b.tricks.length + b.ghosts.length + b.rotors.length + b.dormant.length + b.warnings.length + b.active.length + b.enemies.length + b.coins.length + b.fakeCoins.length + b.trickCoins.length + b.keys.length + 2;
    return b;
  }

  updateMetrics(world, view) {
    this.metrics.drawn = view.totalDrawn;
    this.metrics.total = (world.performance?.totalPlatforms || 0) + view.enemies.length + view.coins.length + view.fakeCoins.length + view.trickCoins.length + view.keys.length + (world.spikes?.traps?.length || 0) + 2;
    world.renderMetrics = this.metrics;
  }

  mergeVisibleHazards(world, x, width, out, state) {
    out.length = 0; const left = x - 140, right = x + width + 140;
    const spikeList = state === 'active' ? world.spikes.active() : state === 'warning' ? world.spikes.warning() : world.spikes.dormant?.() || [];
    for (const item of spikeList) if (item.x + item.w >= left && item.x <= right) out.push(item);
    if (state !== 'dormant') {
      const curse = state === 'active' ? world.momentumCurse?.active?.() || [] : world.momentumCurse?.warning?.() || [];
      for (const item of curse) if (item.x + item.w >= left && item.x <= right) out.push(item);
    }
  }

  background(c) { c.fillStyle = '#080414'; c.fillRect(0, 0, this.view.width, this.view.height); }

  hudText(c, w) {
    const compact = this.view.width < 560; c.save(); c.fillStyle = '#fff7ff'; c.font = `900 ${compact ? 13 : 15}px system-ui, sans-serif`;
    c.fillText(w.message || w.level?.law || '', 30, compact ? 126 : 118, Math.max(240, this.view.width - 60)); c.restore();
  }

  platform(c, r, skin) { slab(c, r.x, r.y, r.w, r.h, skin); }
  rect(c, r, fill, stroke) { c.fillStyle = fill; c.fillRect(r.x, r.y, r.w, r.h); c.strokeStyle = stroke; c.lineWidth = 2; c.strokeRect(r.x, r.y, r.w, r.h); }

  rotor(c, r, skin) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2; c.save(); c.translate(cx, cy); c.rotate((r.tilt || 0) * 0.32);
    slab(c, -r.w / 2, -r.h / 2, r.w, r.h, skin); c.fillStyle = skin.trim; c.beginPath(); c.arc(0, 0, 7, 0, Math.PI * 2); c.fill();
    c.fillStyle = skin.bottom; c.fillRect(-r.w / 2 - 8, -3, 8, 6); c.fillRect(r.w / 2, -3, 8, 6); c.restore();
  }

  trick(c, r, skin) {
    if (r.warn === 'safeSpike') { this.safeSpike(c, r, skin); return; }
    if (r.warn === 'baitShift') { this.rect(c, r, '#452048', '#ffd36a'); this.mark(c, r, '↔'); return; }
    if (r.warn === 'ice') { this.rect(c, r, '#195676', '#bffcff'); return; }
    if (r.warn === 'oneWay') { this.rect(c, r, skin.body, skin.trim); c.fillStyle = skin.trim; for (let x = r.x + 8; x < r.x + r.w - 8; x += 20) c.fillRect(x, r.y + r.h - 3, 10, 2); return; }
    if (r.warn === 'booster' || r.warn === 'reverseBooster') { this.booster(c, r, r.warn === 'reverseBooster'); return; }
    falseSlab(c, r.x, r.y, r.w, r.h, skin, r.warn); if (r.warn === 'ambush' || r.warn === 'fakeCheckpoint') this.mark(c, r, '?');
  }

  safeSpike(c, r, skin) { const b = this.safeSpikeBox; b.x = r.x; b.y = r.y; b.w = r.w; b.h = Math.max(20, r.h + 14); this.spike(c, b, '#263b48', '#ffd36a', 0.95); c.fillStyle = skin.trim; c.fillRect(r.x + 5, r.y + r.h - 4, r.w - 10, 3); }
  booster(c, r, reversed) { this.rect(c, r, '#5f2a7d', '#ffd36a'); const dir = reversed ? -(r.dir || 1) : (r.dir || 1); c.fillStyle = '#ffd36a'; c.beginPath(); if (dir > 0) { c.moveTo(r.x + r.w - 18, r.y + 4); c.lineTo(r.x + r.w - 6, r.y + r.h / 2); c.lineTo(r.x + r.w - 18, r.y + r.h - 4); } else { c.moveTo(r.x + 18, r.y + 4); c.lineTo(r.x + 6, r.y + r.h / 2); c.lineTo(r.x + 18, r.y + r.h - 4); } c.closePath(); c.fill(); }
  mark(c, r, text) { c.fillStyle = '#fff7ff'; c.font = '14px system-ui'; c.fillText(text, r.x + r.w / 2 - 5, r.y + 16); }
  ghost(c, r, skin) { falseSlab(c, r.x, r.y, r.w, r.h, skin, r.warn || r.kind || 'ghostSpike'); }
  hero(c, p) { this.playerRenderer.draw(c, p, this.frame); }

  webcamBubble(c, p) { const frame = this.webcam?.frame?.(); if (!frame) return; const cx = p.x + p.w / 2, cy = p.y - 18, r = 22; c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip(); c.drawImage(frame, cx - r, cy - r, r * 2, r * 2); c.restore(); c.strokeStyle = '#9df7ff'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r + 1, 0, Math.PI * 2); c.stroke(); }

  drawPickups(c, view) { for (const coin of view.coins) { const k = coinKind(coin); this.spark(c, coin.x, coin.y, k.color, k.label, false, k.kind); } for (const coin of view.fakeCoins) this.fakeCoinThatLooksReal(c, coin); for (const coin of view.trickCoins) this.trickCoin(c, coin); for (const key of view.keys) this.key(c, key.x, key.y); }
  spark(c, x, y, fill, label, cursed, kind = 'coin') { coinFace(c, x, y, kind === 'maneh' ? 15 : 13, fill, this.frame, label, cursed); }
  fakeCoinThatLooksReal(c, coin) { const k = coinKind(coin); this.spark(c, coin.x, coin.y, k.color, k.label, true, k.kind); }
  trickCoin(c, coin) { const fake = coin.kind === 'revealedSpike' || coin.kind === 'fakeRunner'; this.spark(c, coin.x, coin.y, fake ? '#ff2f6d' : '#ffe28a', fake ? '!' : '₪', fake, fake ? 'fake' : 'coin'); }
  key(c, x, y) { c.fillStyle = '#ffd36a'; c.fillRect(x + 6, y + 12, 22, 5); c.beginPath(); c.arc(x + 6, y + 14, 7, 0, Math.PI * 2); c.fill(); c.fillRect(x + 22, y + 17, 4, 7); }

  enemy(c, e, theme) { const m = enemyMask(e); const color = this.enemyColor(theme, m.color); this.rect(c, e, color, '#ffffff'); c.fillStyle = m.eye; c.fillRect(e.x + 7, e.y + 8, 6, 6); c.fillRect(e.x + Math.max(14, e.w - 13), e.y + 8, 6, 6); if (/Sanctuary/.test(theme)) { c.fillStyle = '#7bd668'; c.fillRect(e.x + 4, e.y - 5, e.w - 8, 5); } if (/Prism|Womb/.test(theme)) { c.fillStyle = '#d98cff'; c.fillRect(e.x + e.w / 2 - 2, e.y - 8, 4, 8); } if (e.dropCoin) this.spark(c, e.x + e.w / 2 - 12, e.y - 28, '#ffd36a', '₪', false, 'coin'); if (m.armored) { c.fillStyle = '#ffffff'; c.fillRect(e.x + 5, e.y + e.h - 8, e.w - 10, 3); } if (m.chaser) { c.fillStyle = '#ff2f6d'; c.fillText('!', e.x + e.w / 2 - 3, e.y - 4); } }
  enemyColor(theme, base) { return ({ gevurahFortress: '#1a1518', tiferesPrism: '#472184', chesedSanctuary: '#214828', binahWomb: '#20133e', void: '#07040e' })[theme] || base; }

  spike(c, s, fill, stroke, scale = 1) { const h = Math.max(6, s.h * scale), y = s.y + s.h - h; c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 2; c.beginPath(); const teeth = Math.max(2, Math.floor(s.w / 18)); c.moveTo(s.x, y + h); for (let i = 0; i < teeth; i += 1) { const x = s.x + i * s.w / teeth; c.lineTo(x + s.w / teeth / 2, y); c.lineTo(x + s.w / teeth, y + h); } c.closePath(); c.fill(); c.stroke(); }
  door(c, d, open, world, skin) { this.rect(c, d, open ? '#1e816f' : skin.body, open ? '#9df7ff' : skin.trim); c.fillStyle = '#fff'; c.font = '16px system-ui'; c.fillText(open ? 'OPEN' : `${world.realCoinsCollected || 0}/${world.realCoinTotal || 0}`, d.x - 2, d.y - 8); }

  deathPrompt(c, world) { const pause = world.deathPause, alpha = Math.max(0, Math.min(1, pause?.promptAlpha || 0)); if (!alpha) return; const { width, height } = this.view, panelW = Math.min(720, width - 32), panelH = Math.min(270, height - 120), x = (width - panelW) / 2, y = Math.max(90, (height - panelH) / 2); c.save(); c.globalAlpha = alpha; c.fillStyle = '#090214'; c.fillRect(x, y, panelW, panelH); c.strokeStyle = '#9df7ff'; c.lineWidth = 2; c.strokeRect(x + 10, y + 10, panelW - 20, panelH - 20); c.textAlign = 'center'; c.fillStyle = '#ffd36a'; c.font = `${width < 560 ? 32 : 42}px serif`; c.fillText('ש ב י ר ה', width / 2, y + 64); c.fillStyle = '#fff7ff'; c.font = `${width < 560 ? 17 : 24}px system-ui`; c.fillText('The vessel shattered into Hebrew letters.', width / 2, y + 112, panelW - 40); c.font = `${width < 560 ? 13 : 17}px system-ui`; c.fillStyle = pause?.ready ? '#9df7ff' : '#ffffff'; c.fillText(pause?.ready ? 'Press any key · tap · Jump' : 'Watch the fragments finish speaking...', width / 2, y + 158, panelW - 40); const loss = String(world.market?.message || '').match(/Lost (\d+)/)?.[1]; if (loss) { c.fillStyle = '#ff6ad5'; c.font = '900 30px system-ui'; c.fillText('-' + loss + ' Shefa', width / 2, y + 202); } c.font = '13px system-ui'; c.fillStyle = '#ffffff'; c.fillText(world.market?.message || world.message || '', width / 2, y + 232, panelW - 40); c.textAlign = 'start'; c.restore(); }
}
