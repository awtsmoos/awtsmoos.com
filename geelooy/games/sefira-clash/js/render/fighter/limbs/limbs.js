/**
 * B"H
 * Hyper-real limb renderer orchestrator.
 *
 * The limbs are lightning, echo, contact, bridge, and bone. The Awtsmoos renews
 * every line from nothing; this renderer only reveals motion, never changes it.
 */
import { drawSkeletonLayer } from './drawSkeletonLayer.js';
import { drawHandsFeet } from './drawHandsFeet.js';
import { drawLimbGhosts } from './drawLimbGhosts.js';
import { drawJointBridges } from './drawJointBridges.js';
import { drawMotionEcho } from './drawMotionEcho.js';

export function drawLimbs(ctx, f, color, language) {
  ctx.lineCap = 'round';
  drawMotionEcho(ctx, f, color);
  drawLimbGhosts(ctx, f, color, language);
  drawSkeletonLayer(ctx, f, 'rgba(0,0,0,.92)', 14);
  drawSkeletonLayer(ctx, f, color, language.limbThickness || 7);
  drawJointBridges(ctx, f, color);
}

export { drawHandsFeet };
