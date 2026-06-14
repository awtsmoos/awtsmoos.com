/**
 * B"H
 * Sculpted shoulder caps.
 *
 * Chapter 199: broad shoulders are the whole declaration. The Awtsmoos places
 * small armor ovals at the top of each arm so the silhouette reads instantly.
 */
export function drawShoulderCaps(ctx, p, mat) {
  const s = p.scale || 1;
  drawCap(ctx, p.leftShoulder, -1, mat, s);
  drawCap(ctx, p.rightShoulder, 1, mat, s);
}

function drawCap(ctx, c, sign, mat, s) {
  ctx.save();
  ctx.translate(c.x, c.y + 4 * s);
  ctx.rotate(sign * .14);
  ctx.fillStyle = mat.shellSoft;
  ctx.strokeStyle = mat.accent;
  ctx.lineWidth = 2.2 * s;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * s, 9 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
