/**
 * B"H
 * Sculpted chest plate.
 *
 * Chapter 197: the torso becomes armor: broad, tapered, dark, and rim-lit.
 */
import { roundRect } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';

export function drawChestPlate(ctx, p, mat) {
  const s = p.scale || 1;
  ctx.save();
  drawNeck(ctx, p, mat, s);
  ctx.fillStyle = mat.shell;
  ctx.strokeStyle = mat.accent;
  ctx.lineWidth = 3.8 * s;
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x - 11 * s, p.leftShoulder.y);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 25 * s, p.rightShoulder.x + 11 * s, p.rightShoulder.y);
  ctx.quadraticCurveTo(p.chest.x + 33 * s, p.pelvis.y - 30 * s, p.rightHip.x + 15 * s, p.rightHip.y + 10 * s);
  ctx.quadraticCurveTo(p.pelvis.x, p.pelvis.y + 24 * s, p.leftHip.x - 15 * s, p.leftHip.y + 10 * s);
  ctx.quadraticCurveTo(p.chest.x - 33 * s, p.pelvis.y - 30 * s, p.leftShoulder.x - 11 * s, p.leftShoulder.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawPanel(ctx, p, mat, s);
  ctx.restore();
}

function drawNeck(ctx, p, mat, s) {
  ctx.fillStyle = mat.shell;
  ctx.strokeStyle = mat.accent;
  ctx.lineWidth = 2.8 * s;
  roundRect(ctx, p.neck.x - MOCKUP.neck.w * s / 2, p.neck.y - 2 * s, MOCKUP.neck.w * s, MOCKUP.neck.h * s, 10 * s);
  ctx.fill();
  ctx.stroke();
}

function drawPanel(ctx, p, mat, s) {
  ctx.globalAlpha = .18;
  ctx.strokeStyle = mat.glint;
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x + 13 * s, p.leftShoulder.y + 8 * s);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 6 * s, p.rightShoulder.x - 13 * s, p.rightShoulder.y + 8 * s);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
