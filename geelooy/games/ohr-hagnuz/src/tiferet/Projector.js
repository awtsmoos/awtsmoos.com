//B"H
import { State } from '../binah/State.js';
import { WorldData, groundGlyph, tileMeta } from '../data/WorldData.js';
import { Ground } from './render/Ground.js';
import { drawGlyphObject } from './render/GlyphRenderer.js';
import { PlayerRenderer, FootstepParticle } from './render/PlayerRenderer.js';
import { PathVisualizer } from '../chochmah/PathVisualizer.js';
import { equipmentLine } from '../yesod/equipment/EquipmentRuntime.js';
import { skillLine } from '../yesod/skills/SkillRuntime.js';
import { dexLine } from '../yesod/musag/MusagDex.js';
import { bookLine } from '../yesod/books/TorahBooks.js';
import { renderBattle } from './render/BattleRenderer.js';

/**
 * B"H
 * @class Projector
 * @description Paints the hidden light into three canvas vessels: earth, forms, and overlay.
 * The Awtsmoos is not drawn as a body or form; every tile is a renewed utterance that
 * receives coordinates, camera softness, and visible order inside the finite canvas.
 */
export class Projector {
  static Caches = {};
  static camSmooth = { x: 0, y: 0, ready: false };

  static warmup() {
    ['layer-bg', 'layer-obj', 'layer-over'].forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.Caches[id] = ctx;
    });
  }

  static size(ctx) {
    return { w: ctx?.canvas?.width || 800, h: ctx?.canvas?.height || 600 };
  }

  static camera(view = { w: 800, h: 600 }) {
    const res = State.Resolution;
    const target = { x: State.Hero.dx - view.w / 2 + res / 2, y: State.Hero.dy - view.h / 2 + res / 2 };
    if (!this.camSmooth.ready) this.camSmooth = { ...target, ready: true };
    this.camSmooth.x += (target.x - this.camSmooth.x) * 0.18;
    this.camSmooth.y += (target.y - this.camSmooth.y) * 0.18;
    return { x: Math.floor(this.camSmooth.x), y: Math.floor(this.camSmooth.y), ...view };
  }

  static project() {
    const bg = this.Caches['layer-bg'];
    const obj = this.Caches['layer-obj'];
    const over = this.Caches['layer-over'];
    if (!bg || !obj || !over) return;
    const cam = this.camera(this.size(obj));
    this.clear(bg, obj, over);
    const queue = [];
    this.drawWorld(bg, obj, queue, cam);
    queue.sort((a, b) => a.y - b.y).forEach(item => item.draw());
    PathVisualizer.draw(obj, State.Hero.stepTick || 0, cam);
    FootstepParticle.update();
    FootstepParticle.draw(obj);
    PlayerRenderer.draw(obj, State.Hero.dx - cam.x, State.Hero.dy - cam.y, State.Resolution, {
      tick: State.Hero.stepTick || 0,
      dir: State.Hero.dir || 'd',
      moving: State.Hero.moving || State.HeroPath.length > 0,
      hp: State.Stats?.light || 100,
      light: State.Stats?.light || 100
    });
    if (State.PathTarget) this.pathTarget(over, cam);
    this.hud(over);
    if (State.ActiveRealm === 'DEBATE') renderBattle(over);
  }

  static clear(bg, obj, over) {
    bg.fillStyle = '#050505';
    bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height);
    obj.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    over.clearRect(0, 0, over.canvas.width, over.canvas.height);
  }

  static drawWorld(bg, obj, queue, cam) {
    const res = State.Resolution;
    const map = WorldData[State.MapId] || [];
    for (let ry = 0; ry < map.length; ry += 1) {
      const row = [...map[ry]];
      for (let rx = 0; rx < row.length; rx += 1) this.drawTile(bg, obj, queue, cam, { rx, ry, glyph: row[rx], res });
    }
  }

  static drawTile(bg, obj, queue, cam, tile) {
    const { rx, ry, glyph, res } = tile;
    const x = rx * res - cam.x;
    const y = ry * res - cam.y;
    if (x <= -res * 2 || x >= cam.w + res * 2 || y <= -res * 2 || y >= cam.h + res * 2) return;
    const meta = tileMeta(glyph);
    Ground.draw(bg, x, y, res, groundGlyph(glyph), rx * 13 + ry * 7);
    if (meta.kind === 'edge') this.portal(obj, x, y, res, meta.edge);
    else if (!['floor', 'grass', 'road'].includes(meta.kind)) {
      queue.push({ y: y + res, draw: () => drawGlyphObject(obj, { meta, glyph, x, y, rx, ry, seed: rx * ry }, res) });
    }
  }

  static pathTarget(ctx, cam) {
    const res = State.Resolution;
    const x = State.PathTarget.x * res - cam.x;
    const y = State.PathTarget.y * res - cam.y;
    ctx.save();
    ctx.strokeStyle = State.PathTarget.valid ? '#fff176' : '#ff6b6b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 4, y + 4, res - 8, res - 8);
    ctx.restore();
  }

  static portal(ctx, x, y, size, edge) {
    const symbol = { N: '^', S: 'v', E: '>', W: '<' }[edge] || '*';
    ctx.save();
    ctx.fillStyle = 'rgba(225,190,231,.25)'; ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    ctx.strokeStyle = '#ce93d8'; ctx.strokeRect(x + 8, y + 8, size - 16, size - 16);
    ctx.fillStyle = '#fffde7'; ctx.font = 'bold 28px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x + size / 2, y + size / 2);
    ctx.restore();
  }

  static hud(ctx) {
    ctx.save(); ctx.font = '14px monospace'; ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.fillRect(10, 10, 780, 118);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.strokeRect(10, 10, 780, 118);
    ctx.fillStyle = '#fffde7';
    ctx.fillText(`Map: ${State.MapId} | Pos: ${State.Hero.cx},${State.Hero.cy} | Light: ${State.Stats.light}/${State.Stats.maxLight} | Lvl ${State.Stats.level} | Sparks ${State.Stats.sparks}`, 22, 22);
    ctx.fillStyle = '#c8e6c9'; ctx.fillText('Click tiles. F1 door, F2 forest, F3 trainer, F4 grass.', 22, 44);
    ctx.fillStyle = '#ffe0c4'; ctx.fillText(equipmentLine(), 22, 64);
    ctx.fillStyle = '#b9f6ca'; ctx.fillText(skillLine(), 22, 82);
    ctx.fillStyle = '#fff176'; ctx.fillText(dexLine(), 22, 100);
    ctx.fillStyle = '#d7ccc8'; ctx.fillText(bookLine(), 390, 82);
    if (State.MessageTTL > 0) { ctx.fillStyle = '#ffe082'; ctx.fillText(State.Message.slice(0, 64), 390, 100); }
    ctx.restore();
  }
}
