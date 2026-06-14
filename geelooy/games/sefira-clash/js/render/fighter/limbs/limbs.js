/**
 * B"H
 * Soft humanoid limb renderer.
 *
 * Chapter 118: no more neon skeleton shouting over the body. Limbs become soft
 * rounded strokes behind the torso, readable but not ruling the silhouette.
 */
import { drawSkeletonLayer } from './drawSkeletonLayer.js';
import { drawHandsFeet } from './drawHandsFeet.js';
import { drawJointBridges } from './drawJointBridges.js';
import { drawMotionEcho } from './drawMotionEcho.js';

function width(language) {
  return language?.behindBody ? 10 : 8;
}

export function drawLimbs(ctx, f, color, language = {}) {
  const w = width(language);
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (!language.behindBody) drawMotionEcho(ctx, f, color);
  drawSkeletonLayer(ctx, f, 'rgba(0,0,0,.62)', w + 5);
  drawSkeletonLayer(ctx, f, color, w);
  if (!language.behindBody) drawJointBridges(ctx, f, color);
  ctx.restore();
}

export { drawHandsFeet };
