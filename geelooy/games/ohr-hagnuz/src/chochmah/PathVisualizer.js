/**
 * B"H
 * @class PathVisualizer
 * @description
 * The path is a thin river of intent. It does not invent a body for the Awtsmoos;
 * it simply marks the finite steps where renewed speech lets the hero cross the map.
 * @sideEffects Draws transient path, destination, and blocked markers on a canvas context.
 */
import { State } from '../binah/State.js';

export class PathVisualizer {
  static blocked = { x: 0, y: 0, visible: false, until: 0 };

  static screenTile(tile, cam) {
    const res = State.Resolution;
    const x = tile.x * res - cam.x;
    const y = tile.y * res - cam.y;
    return { x, y, cx: x + res / 2, cy: y + res / 2 };
  }

  static heroPoint(cam) {
    const res = State.Resolution;
    return { cx: State.Hero.dx - cam.x + res / 2, cy: State.Hero.dy - cam.y + res / 2 };
  }

  static showBlocked(x, y) {
    this.blocked = { x, y, visible: true, until: performance.now() + 650 };
  }

  static clear() {
    this.blocked.visible = false;
  }

  static draw(ctx, tick, cam) {
    if (State.ActiveRealm !== 'OVERWORLD') return;
    this.drawPath(ctx, tick, cam);
    this.drawBlocked(ctx, cam);
  }

  static drawPath(ctx, tick, cam) {
    const path = State.HeroPath || [];
    if (!path.length) return;
    const points = [this.heroPoint(cam), ...path.map(tile => this.screenTile(tile, cam))];
    ctx.save();
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#4fc3f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = -tick * 0.5;
    ctx.beginPath();
    ctx.moveTo(points[0].cx, points[0].cy);
    points.slice(1).forEach(point => ctx.lineTo(point.cx, point.cy));
    ctx.stroke();
    ctx.setLineDash([]);
    points.slice(1).forEach((point, index) => {
      const pulse = 3 + Math.sin(tick * 0.18 + index) * 1.5;
      ctx.beginPath();
      ctx.arc(point.cx, point.cy, 5 + pulse, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.restore();
  }

  static drawBlocked(ctx, cam) {
    if (!this.blocked.visible) return;
    if (performance.now() > this.blocked.until) { this.blocked.visible = false; return; }
    const spot = this.screenTile(this.blocked, cam);
    const size = State.Resolution * 0.22;
    ctx.save();
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(spot.cx - size, spot.cy - size);
    ctx.lineTo(spot.cx + size, spot.cy + size);
    ctx.moveTo(spot.cx + size, spot.cy - size);
    ctx.lineTo(spot.cx - size, spot.cy + size);
    ctx.stroke();
    ctx.restore();
  }
}
