/** B"H — V3 tapered chest. */
export function drawChest(ctx, p, mat) {
  ctx.fillStyle = mat.shell; ctx.strokeStyle = mat.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(p.leftShoulder.x - 8, p.leftShoulder.y);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 18, p.rightShoulder.x + 8, p.rightShoulder.y);
  ctx.quadraticCurveTo(p.chest.x + 26, p.pelvis.y - 34, p.rightHip.x + 12, p.rightHip.y + 7);
  ctx.quadraticCurveTo(p.pelvis.x, p.pelvis.y + 14, p.leftHip.x - 12, p.leftHip.y + 7);
  ctx.quadraticCurveTo(p.chest.x - 26, p.pelvis.y - 34, p.leftShoulder.x - 8, p.leftShoulder.y); ctx.closePath(); ctx.fill(); ctx.stroke();
}
