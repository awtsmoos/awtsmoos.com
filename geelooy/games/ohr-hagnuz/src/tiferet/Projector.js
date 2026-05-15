import { State } from '../binah/State.js';
import { WorldData, groundGlyph, tileMeta } from '../data/WorldData.js';
import { Ground } from './render/Ground.js';
import { Human } from './render/Human.js';
import { drawGlyphObject } from './render/GlyphRenderer.js';
import { equipmentLine } from '../yesod/equipment/EquipmentRuntime.js';
import { skillLine } from '../yesod/skills/SkillRuntime.js';
import { dexLine } from '../yesod/musag/MusagDex.js';
import { bookLine } from '../yesod/books/TorahBooks.js';
import { renderBattle } from './render/BattleRenderer.js';

export class Projector {
  static Caches = {};

  static warmup() {
    ['layer-bg', 'layer-obj', 'layer-over'].forEach(id => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      this.Caches[id] = ctx;
    });
  }

  static camX() {
    return Math.floor(State.Hero.dx - 800 / 2 + State.Resolution / 2);
  }

  static camY() {
    return Math.floor(State.Hero.dy - 600 / 2 + State.Resolution / 2);
  }

  static project() {
    const bg = this.Caches['layer-bg'];
    const obj = this.Caches['layer-obj'];
    const over = this.Caches['layer-over'];
    if (!bg || !obj || !over) return;

    bg.fillStyle = '#050505';
    bg.fillRect(0, 0, bg.canvas.width, bg.canvas.height);
    obj.clearRect(0, 0, obj.canvas.width, obj.canvas.height);
    over.clearRect(0, 0, over.canvas.width, over.canvas.height);

    const queue = [];
    this.drawWorld(bg, obj, queue);
    queue.sort((a, b) => a.y - b.y).forEach(item => item.draw());

    Human.draw(
      obj,
      State.Hero.dx - this.camX(),
      State.Hero.dy - this.camY(),
      State.Resolution,
      State.Hero.dir,
      State.Hero.stepTick
    );

    if (State.PathTarget) this.pathTarget(over);
    this.hud(over);
    if (State.ActiveRealm === 'DEBATE') renderBattle(over);
  }

  static drawWorld(bg, obj, queue) {
    const res = State.Resolution;
    const map = WorldData[State.MapId] || [];
    for (let ry = 0; ry < map.length; ry += 1) {
      const row = [...map[ry]];
      for (let rx = 0; rx < row.length; rx += 1) {
        const glyph = row[rx];
        const x = rx * res - this.camX();
        const y = ry * res - this.camY();
        if (x <= -res * 2 || x >= 800 + res * 2 || y <= -res * 2 || y >= 600 + res * 2) continue;

        const meta = tileMeta(glyph);
        Ground.draw(bg, x, y, res, groundGlyph(glyph), rx * 13 + ry * 7);

        if (meta.kind === 'edge') this.portal(obj, x, y, res, meta.edge);
        else if (meta.kind !== 'floor' && meta.kind !== 'grass' && meta.kind !== 'road') {
          queue.push({ y: y + res, draw: () => drawGlyphObject(obj, glyph, x, y, res, meta) });
        }
      }
    }
  }

  static pathTarget(ctx) {
    const res = State.Resolution;
    const x = State.PathTarget.x * res - this.camX();
    const y = State.PathTarget.y * res - this.camY();
    ctx.save();
    ctx.strokeStyle = '#fff176';
    ctx.lineWidth = 3;
    ctx.strokeRect(x + 4, y + 4, res - 8, res - 8);
    ctx.restore();
  }

  static portal(ctx, x, y, size, edge) {
    const symbol = { N: '^', S: 'v', E: '>', W: '<' }[edge] || '*';
    ctx.save();
    ctx.fillStyle = 'rgba(225,190,231,.25)';
    ctx.fillRect(x + 6, y + 6, size - 12, size - 12);
    ctx.strokeStyle = '#ce93d8';
    ctx.strokeRect(x + 8, y + 8, size - 16, size - 16);
    ctx.fillStyle = '#fffde7';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x + size / 2, y + size / 2);
    ctx.restore();
  }

  static hud(ctx) {
    ctx.save();
    ctx.font = '14px monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = 'rgba(0,0,0,.65)';
    ctx.fillRect(10, 10, 780, 118);
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.strokeRect(10, 10, 780, 118);

    ctx.fillStyle = '#fffde7';
    ctx.fillText(
      `Map: ${State.MapId} | Pos: ${State.Hero.cx},${State.Hero.cy} | Light: ${State.Stats.light}/${State.Stats.maxLight} | Lvl ${State.Stats.level} | Sparks ${State.Stats.sparks}`,
      22,
      22
    );

    ctx.fillStyle = '#c8e6c9';
    ctx.fillText('Click tiles. F1 door, F2 forest, F3 trainer, F4 grass.', 22, 44);

    ctx.fillStyle = '#ffe0c4';
    ctx.fillText(equipmentLine(), 22, 64);

    ctx.fillStyle = '#b9f6ca';
    ctx.fillText(skillLine(), 22, 82);

    ctx.fillStyle = '#fff176';
    ctx.fillText(dexLine(), 22, 100);

    ctx.fillStyle = '#d7ccc8';
    ctx.fillText(bookLine(), 390, 82);

    if (State.MessageTTL > 0) {
      ctx.fillStyle = '#ffe082';
      ctx.fillText(State.Message.slice(0, 64), 390, 100);
    }

    ctx.restore();
  }
}
