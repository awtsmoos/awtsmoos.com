// B"H
import { State } from '../binah/State.js';
import { WorldData, groundGlyph, tileMeta } from '../data/WorldData.js';
import { Ground } from './render/Ground.js';
import { drawGlyphObject } from './render/GlyphRenderer.js';
import { PlayerRenderer } from './render/PlayerRenderer.js';
import { PathVisualizer } from '../chochmah/PathVisualizer.js';
import { renderBattle } from './render/BattleRenderer.js';
import { drawHud } from './render/HudRenderer.js';

/**
 * B"H
 * @class Projector
 * @description Mobile canvas projector for Ohr HaGnuz.
 *
 * Chapter 124: The camera stopped tearing the road in half. The Awtsmoos speaks
 * every atom into being without jerk or delay; this projector now follows the
 * hero's interpolated body pixels, not the destination tile that was already
 * counted by logic. The world glides as one garment around the walker.
 */
export class Projector {
  static Caches = {};
  static staticKey = '';
  static lastSize = { w: 0, h: 0 };

  /** @returns {void} */
  static warmup() {
    ['layer-bg', 'layer-obj', 'layer-over'].forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { alpha: id !== 'layer-bg' });
      ctx.imageSmoothingEnabled = false;
      this.Caches[id] = ctx;
    });
    this.resizeCanvases(true);
  }

  /** @param {boolean} force @returns {boolean} */
  static resizeCanvases(force = false) {
    let changed = false;
    Object.values(this.Caches).forEach(ctx => {
      const box = ctx.canvas.getBoundingClientRect?.() || {};
      const w = Math.max(320, Math.round(box.width || ctx.canvas.width || window.innerWidth || 390));
      const h = Math.max(480, Math.round(box.height || ctx.canvas.height || window.innerHeight || 844));
      if (!force && ctx.canvas.width === w && ctx.canvas.height === h) return;
      ctx.canvas.width = w;
      ctx.canvas.height = h;
      ctx.imageSmoothingEnabled = false;
      changed = true;
    });
    const obj = this.Caches['layer-obj'];
    if (obj) this.lastSize = { w: obj.canvas.width, h: obj.canvas.height };
    if (changed) this.staticKey = '';
    return changed;
  }

  /** @param {CanvasRenderingContext2D} ctx @returns {{w:number,h:number}} */
  static size(ctx) {
    return { w: ctx?.canvas?.width || 390, h: ctx?.canvas?.height || 844 };
  }

  /** @param {{w:number,h:number}} view @returns {{x:number,y:number,w:number,h:number}} */
  static camera(view = { w: 390, h: 844 }) {
    const res = State.Resolution;
    return {
      x: State.Hero.dx - view.w / 2 + res / 2,
      y: State.Hero.dy - view.h / 2 + res / 2,
      ...view
    };
  }

  /** @returns {void} */
  static project() {
    const bg = this.Caches['layer-bg'];
    const obj = this.Caches['layer-obj'];
    const over = this.Caches['layer-over'];
    if (!bg || !obj || !over) return;
    this.resizeCanvases(false);
    const cam = this.camera(this.size(obj));
    if (State.ActiveRealm === 'DEBATE') return this.drawBattle(bg, obj, over);
    this.drawStaticIfNeeded(bg, obj, cam);
    this.drawDynamic(over, cam);
  }

  /** @returns {void} */
  static drawBattle(bg, obj, over) {
    [bg, obj, over].forEach(ctx => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height));
    bg.fillStyle = '#050714';
    bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height);
    renderBattle(over);
    this.staticKey = '';
  }

  /** @returns {void} */
  static drawStaticIfNeeded(bg, obj, cam) {
    const key = `${State.MapId}:${Math.round(cam.x)}:${Math.round(cam.y)}:${cam.w}:${cam.h}`;
    if (key === this.staticKey) return;
    this.staticKey = key;
    bg.fillStyle = '#05070b';
    bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height);
    obj.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    const queue = [];
    this.drawWorld(bg, obj, queue, cam);
    queue.sort((a, b) => a.y - b.y).forEach(item => item.draw());
  }

  /** @returns {void} */
  static drawDynamic(ctx, cam) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    PathVisualizer.draw(ctx, State.Hero.stepTick || 0, cam);
    this.drawHero(ctx, cam);
    if (State.PathTarget) this.pathTarget(ctx, cam);
    drawHud(ctx);
  }

  /** @returns {void} */
  static drawHero(ctx, cam) {
    PlayerRenderer.draw(ctx, State.Hero.dx - cam.x, State.Hero.dy - cam.y, State.Resolution, {
      tick: State.Hero.stepTick || 0,
      dir: State.Hero.dir || 'd',
      moving: State.Hero.moving || State.HeroPath.length > 0,
      light: State.Stats?.light || 100
    });
  }

  /** @returns {void} */
  static drawWorld(bg, obj, queue, cam) {
    const res = State.Resolution;
    const map = WorldData[State.MapId] || [];
    const bounds = this.visibleTileBounds(map, cam, res);
    for (let ry = bounds.y0; ry <= bounds.y1; ry += 1) {
      const row = [...(map[ry] || '')];
      for (let rx = bounds.x0; rx <= bounds.x1; rx += 1) {
        this.drawTile(bg, obj, queue, cam, { rx, ry, glyph: row[rx] || ' ', res });
      }
    }
  }

  /** @returns {{x0:number,x1:number,y0:number,y1:number}} */
  static visibleTileBounds(map, cam, res) {
    const width = Math.max(1, ...map.map(row => [...row].length));
    const height = map.length || 1;
    return {
      x0: Math.max(0, Math.floor(cam.x / res) - 2),
      y0: Math.max(0, Math.floor(cam.y / res) - 2),
      x1: Math.min(width - 1, Math.ceil((cam.x + cam.w) / res) + 2),
      y1: Math.min(height - 1, Math.ceil((cam.y + cam.h) / res) + 2)
    };
  }

  /** @returns {void} */
  static drawTile(bg, obj, queue, cam, tile) {
    const { rx, ry, glyph, res } = tile;
    const x = Math.round(rx * res - cam.x);
    const y = Math.round(ry * res - cam.y);
    const meta = tileMeta(glyph);
    Ground.draw(bg, x, y, res, groundGlyph(glyph), rx * 13 + ry * 7);
    if (meta.kind === 'edge') this.portal(obj, x, y, res, meta.edge);
    else if (!['floor', 'grass', 'road'].includes(meta.kind)) queue.push({ y: y + res, draw: () => drawGlyphObject(obj, { meta, glyph, x, y, rx, ry, seed: rx * ry + 1 }, res) });
  }

  /** @returns {void} */
  static pathTarget(ctx, cam) {
    const res = State.Resolution;
    const x = State.PathTarget.x * res - cam.x;
    const y = State.PathTarget.y * res - cam.y;
    ctx.strokeStyle = State.PathTarget.valid ? '#fff176' : '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 4, y + 4, res - 8, res - 8);
  }

  /** @returns {void} */
  static portal(ctx, x, y, size, edge) {
    const symbol = { N: '^', S: 'v', E: '>', W: '<' }[edge] || '*';
    ctx.fillStyle = '#301f3b';
    ctx.fillRect(x + 8, y + 8, size - 16, size - 16);
    ctx.strokeStyle = '#ce93d8';
    ctx.strokeRect(x + 8, y + 8, size - 16, size - 16);
    ctx.fillStyle = '#fffde7';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x + size / 2, y + size / 2);
  }
}
