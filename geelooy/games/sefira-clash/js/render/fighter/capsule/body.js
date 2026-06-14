/**
 * B"H
 * Premium capsule torso body.
 *
 * Chapter 138: the fighter now wears a suit of readable mass: broad chest,
 * narrow waist, quiet pelvis, visible belt, and neck tucked beneath the helmet.
 */
function torsoPath(ctx, p) {
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x - 5, p.leftShoulder.y + 1);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 17, p.rightShoulder.x + 5, p.rightShoulder.y + 1);
  ctx.quadraticCurveTo(p.chest.x + 23, p.pelvis.y - 18, p.rightHip.x + 10, p.rightHip.y + 8);
  ctx.quadraticCurveTo(p.pelvis.x, p.pelvis.y + 19, p.leftHip.x - 10, p.leftHip.y + 8);
  ctx.quadraticCurveTo(p.chest.x - 23, p.pelvis.y - 18, p.leftShoulder.x - 5, p.leftShoulder.y + 1);
  ctx.closePath();
}

export function drawCapsuleBody(ctx, p, color) {
  ctx.save();
  drawNeck(ctx, p, color);
  drawSuit(ctx, p, color);
  drawChestHighlight(ctx, p);
  drawBelt(ctx, p, color);
  ctx.restore();
}

function drawSuit(ctx, p, color) {
  ctx.fillStyle = 'rgba(5,7,10,.96)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.8;
  torsoPath(ctx, p);
  ctx.fill();
  ctx.stroke();
}

function drawNeck(ctx, p, color) {
  ctx.fillStyle = 'rgba(6,8,12,.98)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  roundRect(ctx, p.neck.x - 7, p.neck.y + 2, 14, 20, 6);
  ctx.fill();
  ctx.stroke();
}

function drawChestHighlight(ctx, p) {
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = 'rgba(255,255,255,.82)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(p.leftShoulder.x + 8, p.leftShoulder.y + 10);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y + 2, p.rightShoulder.x - 8, p.rightShoulder.y + 10);
  ctx.stroke();
  ctx.restore();
}

function drawBelt(ctx, p, color) {
  ctx.save();
  ctx.globalAlpha = 0.86;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(p.leftHip.x - 7, p.leftHip.y + 3);
  ctx.lineTo(p.rightHip.x + 7, p.rightHip.y + 3);
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
