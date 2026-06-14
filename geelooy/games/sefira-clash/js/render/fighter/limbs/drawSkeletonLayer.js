/**
 * B"H
 * Layered skeleton renderer.
 *
 * Chapter 96: first a soft shadow, then living color, then small joints. The
 * limbs are no longer squashed thunder; they are readable sparks of a body.
 */
import { drawBoneLine } from './drawBoneLine.js';

function drawableBones(f) {
  return Object.values(f.bones || {}).filter(bone => bone && bone.id !== 'root' && bone.id !== 'head');
}

function drawJoint(ctx, point, radius) {
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawSkeletonLayer(ctx, f, stroke, width) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(2, width || 5);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const bone of drawableBones(f)) drawBoneLine(ctx, bone);
  ctx.fillStyle = stroke;
  for (const bone of drawableBones(f)) drawJoint(ctx, bone.root, Math.max(1.5, ctx.lineWidth * 0.22));
  ctx.restore();
}
