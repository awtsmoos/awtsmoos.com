/**
 * B"H
 * @module PlayerRenderer
 *
 * Chapter 69: The traveler stopped wobbling like a signpost.
 * The Awtsmoos has no body and no form; motion is now a controlled pixel walk:
 * tiny bob, clean sway, measured dust, and no strange body rotation.
 */
import { resolvePose, walkCycle } from './player/PlayerPose.js';
import { drawArm, drawLegs, drawShadow, drawTorso } from './player/PlayerBodyParts.js';
import { drawHead } from './player/PlayerHead.js';
import { FootstepParticle } from './player/FootstepParticle.js';

const drawGlowAura = (ctx, size, moving) => {
  ctx.save();
  ctx.globalAlpha = moving ? .18 : .1;
  const gradient = ctx.createRadialGradient(0, size * .1, 0, 0, size * .1, size * .8);
  gradient.addColorStop(0, 'rgba(255,232,140,.62)');
  gradient.addColorStop(.5, 'rgba(255,175,80,.22)');
  gradient.addColorStop(1, 'rgba(255,150,50,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, size * .76, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawLightBar = (ctx, x, y, size, light) => {
  if (light === undefined) return;
  const w = size * .86;
  const h = 5;
  const bx = x + size / 2 - w / 2;
  const by = y - size * .18;
  const ratio = Math.min(1, Math.max(0, light / 120));
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.56)';
  ctx.strokeStyle = 'rgba(255,241,118,.55)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, h / 2);
  ctx.fill();
  ctx.stroke();
  const g = ctx.createLinearGradient(bx, by, bx + w, by);
  g.addColorStop(0, '#fff176');
  g.addColorStop(1, '#ff9800');
  ctx.fillStyle = g;
  ctx.fillRect(bx + 1, by + 1, (w - 2) * ratio, h - 2);
  ctx.restore();
};

const spawnStep = (x, y, size, tick, moving) => {
  if (!moving) return;
  const frame = Math.floor(tick / 8);
  if (frame % 2 === 0 && tick % 8 === 0) FootstepParticle.spawn(x + size / 2, y + size * .8);
};

export class PlayerRenderer {
  static draw(ctx, x, y, size, state) {
    const { tick = 0, dir = 'd', moving = false, light } = state || {};
    const pose = resolvePose(dir);
    const cycle = walkCycle(tick);
    const sway = moving ? Math.sin(tick * .16) * 1.1 : 0;
    const bob = moving ? cycle.bob * size / 22 : Math.sin(tick * .05) * .25;
    spawnStep(x, y, size, tick, moving);
    ctx.save();
    ctx.translate(x + size / 2 + sway, y + size / 2 - bob);
    ctx.scale(pose.mirror, 1);
    drawGlowAura(ctx, size, moving);
    drawShadow(ctx, size);
    drawArm(ctx, size, pose, cycle, false);
    drawLegs(ctx, size, pose, cycle);
    drawTorso(ctx, size, pose, cycle);
    drawArm(ctx, size, pose, cycle, true);
    drawHead(ctx, size, pose);
    ctx.restore();
    drawLightBar(ctx, x, y, size, light);
  }
}

export { FootstepParticle };
