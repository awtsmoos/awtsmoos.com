/**
 * B"H
 * Authored hero suit torso.
 *
 * Chapter 168: the torso becomes the crown of the silhouette: broad shoulders,
 * compact waist, glowing belt, and a dark suit that reads on mobile.
 */
function torsoPath(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x - 10, p.leftShoulder.y + 1);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 24, p.rightShoulder.x + 10, p.rightShoulder.y + 1);
  ctx.quadraticCurveTo(p.chest.x + 30, p.pelvis.y - 28, p.rightHip.x + 13, p.rightHip.y + 10);
  ctx.quadraticCurveTo(p.pelvis.x, p.pelvis.y + 22, p.leftHip.x - 13, p.leftHip.y + 10);
  ctx.quadraticCurveTo(p.chest.x - 30, p.pelvis.y - 28, p.leftShoulder.x - 10, p.leftShoulder.y + 1);
  ctx.closePath();
}

export function drawCapsuleBody(ctx, p, color) {
  ctx.save();
  drawNeck(ctx, p, color);
  drawSuit(ctx, p, color);
  drawBelt(ctx, p, color);
  drawHighlights(ctx, p);
  ctx.restore();
}

function drawSuit(ctx, p, color) {
  ctx.fillStyle = 'rgba(3,5,9,.99)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.6;
  torsoPath(ctx, p);
  ctx.fill();
  ctx.stroke();
}

function drawNeck(ctx, p, color) {
  ctx.fillStyle = 'rgba(3,5,9,1)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  roundRect(ctx, p.neck.x - 10, p.neck.y - 1, 20, 28, 9);
  ctx.fill();
  ctx.stroke();
}

function drawBelt(ctx, p, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7.5;
  ctx.globalAlpha = 0.96;
  ctx.beginPath();
  ctx.moveTo(p.leftHip.x - 10, p.leftHip.y + 4);
  ctx.lineTo(p.rightHip.x + 10, p.rightHip.y + 4);
  ctx.stroke();
  ctx.restore();
}

function drawHighlights(ctx, p) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x + 12, p.leftShoulder.y + 9);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 4, p.rightShoulder.x - 12, p.rightShoulder.y + 9);
  ctx.stroke();
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
