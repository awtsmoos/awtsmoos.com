/**
 * B"H
 * @module PlayerRenderer
 *
 * Chapter 10: No More Rotated Mannequin.
 * The Awtsmoos has no body and no form; the player is a drawn finite vessel,
 * so the back has hidden face and hair, the side has profile and narrow body,
 * and the front has eyes and beard. Direction is now anatomy, not rotation.
 */
import { resolvePose, walkCycle } from './player/PlayerPose.js';
import { drawArm, drawLegs, drawShadow, drawTorso } from './player/PlayerBodyParts.js';
import { drawHead } from './player/PlayerHead.js';
import { FootstepParticle } from './player/FootstepParticle.js';

/**
 * Draws the soft aura that appears around a moving player.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} size - Tile size.
 * @returns {void}
 */
const drawGlowAura = (ctx, size) => {
  ctx.save();
  ctx.globalAlpha = 0.18;
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
  gradient.addColorStop(0, 'rgba(255, 255, 200, 0.75)');
  gradient.addColorStop(0.55, 'rgba(255, 200, 100, 0.34)');
  gradient.addColorStop(1, 'rgba(255, 150, 50, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

/**
 * Draws the light bar above the player.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - Player x.
 * @param {number} y - Player y.
 * @param {number} size - Tile size.
 * @param {number} light - Current light.
 * @returns {void}
 */
const drawLightBar = (ctx, x, y, size, light) => {
  if (light === undefined) return;
  const w = size * 0.8;
  const h = 4;
  const bx = x + size / 2 - w / 2;
  const by = y - size / 3;
  const ratio = Math.min(1, Math.max(0, light / 100));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(bx, by, w, h);
  const g = ctx.createLinearGradient(bx, by, bx + w * ratio, by);
  g.addColorStop(0, '#ffd700');
  g.addColorStop(1, '#ffaa00');
  ctx.fillStyle = g;
  ctx.fillRect(bx + 1, by + 1, (w - 2) * ratio, h - 2);
  ctx.restore();
};

/**
 * Draws one true-direction player frame.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context.
 * @param {number} x - Screen x.
 * @param {number} y - Screen y.
 * @param {number} size - Tile size.
 * @param {{tick:number,dir:string,moving:boolean,hp:number,light:number}} state - Animation state.
 * @returns {void}
 */
export class PlayerRenderer {
  static draw(ctx, x, y, size, state) {
    const { tick = 0, dir = 'd', moving = false, light } = state || {};
    const pose = resolvePose(dir);
    const cycle = walkCycle(tick);
    const smoothX = x + Math.sin(tick * 0.1) * 1.4;
    const smoothY = y + Math.cos(tick * 0.15) * 0.8;
    if (moving && tick % 8 === 0) FootstepParticle.spawn(x + size / 2, y + size * 0.78);
    ctx.save();
    ctx.translate(smoothX + size / 2, smoothY + size / 2 - cycle.bob * size / 14);
    ctx.scale(pose.mirror, 1);
    drawShadow(ctx, size);
    drawArm(ctx, size, pose, cycle, false);
    drawLegs(ctx, size, pose, cycle);
    drawTorso(ctx, size, pose, cycle);
    drawArm(ctx, size, pose, cycle, true);
    drawHead(ctx, size, pose);
    if (moving && tick % 2 === 0) drawGlowAura(ctx, size);
    ctx.restore();
    drawLightBar(ctx, x, y, size, light);
  }
}

export { FootstepParticle };
