/* B"H */
import { FoodPropRenderer } from '../../core/renderer/props/FoodPropRenderer.js';

/** Draws props, including production food objects and legacy held items. */
export class PropManager {
  static render(ctx, props, characters = {}) {
    const list = Array.isArray(props) ? props : Object.values(props || {});
    list.filter(p => p && p.visible !== false).forEach(prop => this.renderOne(ctx, prop, characters));
  }

  static renderOne(ctx, prop, characters) {
    ctx.save();
    this.applyTransform(ctx, prop, characters);
    ctx.rotate((prop.rotation || 0) * Math.PI / 180);
    this.drawProp(ctx, prop);
    ctx.restore();
  }

  static applyTransform(ctx, prop, characters) {
    if (!prop.attachedTo) return ctx.translate(prop.x || 0, prop.y || 0);
    const parent = characters[prop.attachedTo.charId];
    const matrix = parent ? parent[`bone_${prop.attachedTo.bone || 'wrist_right'}`] : null;
    if (!matrix || !parent) return ctx.translate(prop.x || 0, prop.y || 0);
    ctx.setTransform(matrix);
    const flip = parent.flipX ? -1 : 1;
    ctx.translate((prop.attachedTo.offsetX || 0) * flip, prop.attachedTo.offsetY || 10);
    if (parent.flipX) ctx.scale(-1, 1);
  }

  static drawProp(ctx, prop) {
    if (FoodPropRenderer.draw(ctx, prop)) return;
    if (prop.type === 'frisbee') return this.frisbee(ctx, prop);
    if (prop.type === 'book') return this.book(ctx, prop);
    return this.box(ctx, prop);
  }

  static frisbee(ctx, prop) { ctx.beginPath(); ctx.ellipse(0, 0, 30, 8, 0, 0, Math.PI * 2); ctx.fillStyle = prop.color || '#ff0055'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke(); }
  static book(ctx, prop) { ctx.fillStyle = prop.color || '#8b4513'; ctx.fillRect(-15, -20, 30, 40); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(-15, -20, 30, 40); ctx.fillStyle = '#fff'; ctx.fillRect(-12, -18, 24, 36); }
  static box(ctx, prop) { const s = prop.size || 22; ctx.fillStyle = prop.color || '#b87934'; ctx.fillRect(-s / 2, -s / 2, s, s); ctx.strokeStyle = '#111'; ctx.lineWidth = 2; ctx.strokeRect(-s / 2, -s / 2, s, s); }
}
