// B"H
import { coinKind } from '../systems/currency.js';
import { enemyMask } from '../systems/enemyArchetypes.js';
import { visibleBodies, visiblePoints } from '../systems/renderCulling.js';
import { DeathBurstRenderer } from '../render/deathBurstRenderer.js';

/**
 * Renderer paints the visible lie and the death witness.
 *
 * The Awtsmoos reveals and conceals: coins that are spikes, platforms that are
 * ghosts, and an explosion that must be seen before the overlay arrives. During
 * death the camera locks to the old shatter site, the prompt fades in slowly,
 * and the UI becomes a glassy Hebrew-letter memorial instead of an instant mask.
 */
export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.camera = { x: 0 };
    this.metrics = { drawn: 0, total: 0 };
    this.deathBursts = new DeathBurstRenderer();
  }

  draw(world) {
    const c = this.ctx;
    if (!c || !world?.player) return;
    this.camera.x = this.cameraX(world);
    this.background(c);
    this.hudText(c, world);
    c.save();
    c.translate(-this.camera.x, 0);
    const view = this.collectView(world);
    this.metrics = { drawn: view.totalDrawn, total: (world.performance?.totalPlatforms || 0) + view.enemies.length + view.coins.length + view.fakeCoins.length + view.trickCoins.length + view.keys.length + (world.spikes?.traps?.length || 0) + 2 };
    world.renderMetrics = this.metrics;
    for (const p of view.platforms) this.rect(c, p, '#3b2a66', '#9df7ff');
    for (const p of view.tricks) this.trick(c, p);
    for (const p of view.ghosts) this.ghost(c, p);
    for (const p of view.rotors) this.rotor(c, p);
    for (const s of view.warnings) this.spike(c, s, '#56eaff77', '#bffcff');
    for (const s of view.active) this.spike(c, s, '#ff2f6d', '#ffe28a');
    this.door(c, world.level.door, world.keyCount > 0);
    for (const coin of view.coins) { const k = coinKind(coin); this.spark(c, coin.x, coin.y, k.color, k.label, false); }
    for (const coin of view.fakeCoins) this.fakeCoinThatLooksReal(c, coin);
    for (const coin of view.trickCoins) this.trickCoin(c, coin);
    for (const key of view.keys) this.spark(c, key.x, key.y, '#9df7ff', '⚿', false);
    for (const e of view.enemies) this.enemy(c, e);
    if (!world.deathPause) this.hero(c, world.player);
    this.deathBursts.draw(c, world.deathBursts || []);
    c.restore();
    if (world.deathPause) this.deathPrompt(c, world);
  }

  cameraX(world) {
    if (world.deathPause?.cameraX !== undefined) return world.deathPause.cameraX;
    return Math.max(0, Math.min(Math.max(0, world.width - 960), world.player.x - 430));
  }

  collectView(world) {
    const x = this.camera.x;
    const platforms = visibleBodies(world.level.platforms || [], x);
    const tricks = visibleBodies(world.tricks.visualBodies ? world.tricks.visualBodies() : world.tricks.bodies(), x);
    const ghosts = world.tricks.hazardBodies ? visibleBodies(world.tricks.hazardBodies(), x) : [];
    const rotors = visibleBodies(world.rotors.bodies(), x);
    const warnings = visibleBodies([...(world.spikes.warning()), ...(world.momentumCurse?.warning?.() || [])], x);
    const active = visibleBodies([...(world.spikes.active()), ...(world.momentumCurse?.active?.() || [])], x);
    const enemies = visibleBodies(world.enemies || [], x);
    const coins = visiblePoints(world.coins || [], x);
    const fakeCoins = visiblePoints(world.fakeCoins || [], x);
    const trickCoins = visiblePoints(world.trickCoins?.coins || [], x);
    const keys = visiblePoints(world.keys || [], x);
    return { platforms, tricks, ghosts, rotors, warnings, active, enemies, coins, fakeCoins, trickCoins, keys, totalDrawn: platforms.length + tricks.length + ghosts.length + rotors.length + warnings.length + active.length + enemies.length + coins.length + fakeCoins.length + trickCoins.length + keys.length + 2 };
  }

  background(c) { c.clearRect(0, 0, 960, 540); const g = c.createLinearGradient(0, 0, 0, 540); g.addColorStop(0, '#24114f'); g.addColorStop(0.55, '#130727'); g.addColorStop(1, '#06020d'); c.fillStyle = g; c.fillRect(0, 0, 960, 540); c.fillStyle = '#ffffff22'; for (let i = 0; i < 80; i += 1) c.fillRect((i * 83) % 960, (i * 47) % 300, 2, 2); }
  hudText(c, w) { c.fillStyle = '#fff7ff'; c.font = '18px system-ui, sans-serif'; c.fillText(w.message || w.level?.law || '', 24, 34); c.fillStyle = '#9df7ff'; c.font = '13px system-ui, sans-serif'; c.fillText(`draw ${this.metrics.drawn}/${this.metrics.total} · checks ${w.performance.platformChecks}/${w.performance.totalPlatforms}`, 24, 56); }
  rect(c, r, fill, stroke) { c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 3; c.fillRect(r.x, r.y, r.w, r.h); c.strokeRect(r.x, r.y, r.w, r.h); }
  rotor(c, r) { c.save(); c.translate(r.x + r.w / 2, r.y + r.h / 2); c.rotate((r.tilt || 0) * 0.32); this.rect(c, { x: -r.w / 2, y: -r.h / 2, w: r.w, h: r.h }, '#255272', '#ffe28a'); c.restore(); }

  trick(c, r) {
    if (['falseSpike', 'phantom', 'commitDrop', 'fakeCheckpoint'].includes(r.warn)) { this.regularLookingLie(c, r); return; }
    if (r.warn === 'ice') { this.rect(c, r, '#194b70', '#bffcff'); c.fillStyle = '#d7ffff88'; for (let x = r.x + 8; x < r.x + r.w - 8; x += 16) c.fillRect(x, r.y + 4, 8, 2); return; }
    if (r.warn === 'booster' || r.warn === 'reverseBooster') { this.booster(c, r, r.warn === 'reverseBooster'); return; }
    const fill = r.warn === 'shatter' ? '#5b3c63' : r.warn === 'vanish' ? '#285263' : '#4b3678';
    this.rect(c, r, fill, '#d7fffb');
    if (r.warn === 'shatter') { c.fillStyle = '#ffffffaa'; c.fillRect(r.x + 8, r.y + 5, r.w - 16, 2); }
    if (r.warn === 'ambush') { c.fillStyle = '#ffffffaa'; c.font = '14px serif'; c.fillText('?', r.x + r.w / 2 - 4, r.y + 16); }
  }

  regularLookingLie(c, r) { this.rect(c, r, '#3b2a66', '#9df7ff'); if (r.warn === 'phantom') { c.fillStyle = '#ffffff18'; c.fillRect(r.x + 5, r.y + 4, r.w - 10, 2); } }
  booster(c, r, reversed) { this.rect(c, r, '#5f2a7d', '#ffd36a'); c.fillStyle = '#ffd36a'; const dir = reversed ? -(r.dir || 1) : (r.dir || 1); c.beginPath(); if (dir > 0) { c.moveTo(r.x + r.w - 18, r.y + 4); c.lineTo(r.x + r.w - 6, r.y + r.h / 2); c.lineTo(r.x + r.w - 18, r.y + r.h - 4); } else { c.moveTo(r.x + 18, r.y + 4); c.lineTo(r.x + 6, r.y + r.h / 2); c.lineTo(r.x + 18, r.y + r.h - 4); } c.closePath(); c.fill(); }
  ghost(c, r) { c.save(); c.globalAlpha = 0.22; this.rect(c, r, '#3b2a66', '#9df7ff'); c.restore(); }
  hero(c, p) { const s = p.skin || {}; this.rect(c, p, s.body || '#ffffff', s.trim || '#ffe28a'); c.fillStyle = '#16091f'; c.fillRect(p.x + 8, p.y + 12, 6, 6); c.fillRect(p.x + 21, p.y + 12, 6, 6); c.beginPath(); c.arc(p.x + p.w / 2, p.y + 4, 15, Math.PI, Math.PI * 2); c.fillStyle = s.kippah || '#1a0b2d'; c.fill(); }
  enemy(c, e) { const m = enemyMask(e); this.rect(c, e, m.color, '#ff6ad5'); c.fillStyle = m.eye; c.fillRect(e.x + 7, e.y + 8, 6, 6); c.fillRect(e.x + Math.max(14, e.w - 13), e.y + 8, 6, 6); if (m.armored) { c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.beginPath(); c.moveTo(e.x + 4, e.y + 4); c.lineTo(e.x + e.w - 4, e.y + e.h - 4); c.stroke(); } if (m.chaser) { c.fillStyle = '#ff2f6d'; c.fillText('!', e.x + e.w / 2 - 3, e.y - 4); } }
  spike(c, s, fill, stroke) { c.fillStyle = fill; c.strokeStyle = stroke; c.lineWidth = 2; c.beginPath(); const teeth = Math.max(2, Math.floor(s.w / 18)); c.moveTo(s.x, s.y + s.h); for (let i = 0; i < teeth; i += 1) { const x = s.x + i * s.w / teeth; c.lineTo(x + s.w / teeth / 2, s.y); c.lineTo(x + s.w / teeth, s.y + s.h); } c.closePath(); c.fill(); c.stroke(); }
  spark(c, x, y, fill, label, cursed) { c.beginPath(); c.arc(x + 13, y + 13, 13, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); if (cursed) { c.strokeStyle = '#ff2f6d'; c.lineWidth = 3; c.stroke(); } c.fillStyle = '#14081f'; c.font = '18px serif'; c.textAlign = 'center'; c.fillText(label, x + 13, y + 19); c.textAlign = 'start'; }
  fakeCoinThatLooksReal(c, coin) { const kind = coinKind(coin); this.spark(c, coin.x, coin.y, kind.color, kind.label, false); c.fillStyle = '#ffffff33'; c.fillRect(coin.x + 8, coin.y + 3, 10, 2); }
  trickCoin(c, coin) { const fake = coin.kind === 'revealedSpike' || coin.kind === 'fakeRunner'; const flee = ['runner', 'panicRunner', 'iceRunner', 'reverseRunner', 'trapBait', 'shyVanish'].includes(coin.kind); this.spark(c, coin.x, coin.y, fake ? '#ff2f6d' : '#ffe28a', fake ? '!' : '₪', fake); if (flee) { c.strokeStyle = '#9df7ff'; c.beginPath(); c.moveTo(coin.x + 6, coin.y + 6); c.lineTo(coin.x - 8, coin.y + 13); c.lineTo(coin.x + 6, coin.y + 20); c.stroke(); } }
  door(c, d, open) { this.rect(c, d, open ? '#1e816f' : '#65438c', open ? '#9df7ff' : '#ffd36a'); c.fillStyle = '#fff'; c.font = '16px system-ui'; c.fillText(open ? 'OPEN' : 'KEY', d.x - 2, d.y - 8); }

  deathPrompt(c, world) {
    const pause = world.deathPause;
    const alpha = Math.max(0, Math.min(1, pause?.promptAlpha || 0));
    if (!alpha) return;
    c.save();
    c.globalAlpha = alpha;
    const panel = c.createLinearGradient(0, 120, 0, 410);
    panel.addColorStop(0, '#05010dcc');
    panel.addColorStop(0.45, '#1b0738dd');
    panel.addColorStop(1, '#05010dcc');
    c.fillStyle = panel;
    c.fillRect(120, 130, 720, 250);
    c.strokeStyle = '#9df7ff';
    c.lineWidth = 2;
    c.strokeRect(132, 142, 696, 226);
    c.fillStyle = '#ffd36a';
    c.font = '42px serif';
    c.textAlign = 'center';
    c.fillText('ש ב י ר ה', 480, 195);
    c.fillStyle = '#fff7ff';
    c.font = '24px system-ui, sans-serif';
    c.fillText('The vessel shattered into Hebrew letters.', 480, 245);
    c.font = '17px system-ui, sans-serif';
    c.fillStyle = pause?.ready ? '#9df7ff' : '#ffffffaa';
    c.fillText(pause?.ready ? 'Press any key · tap · joystick OK' : 'Watch the fragments finish speaking...', 480, 292);
    c.font = '14px system-ui, sans-serif';
    c.fillStyle = '#ffffff99';
    c.fillText(world.market?.message || world.message || '', 480, 330);
    c.textAlign = 'start';
    c.restore();
  }
}
