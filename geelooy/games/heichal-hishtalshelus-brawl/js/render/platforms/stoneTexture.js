/**
 * B"H — Stone is made of cracks, caps, and small ink shadows. The platform
 * stays flat 2D but gains enough procedural texture to echo the mockup's
 * hand-drawn slab style.
 */
export function drawStonePlatform(ctx, p, palette) {
  ctx.fillStyle = palette.platform;
  ctx.fillRect(p.x, p.y, p.w, p.h);
  ctx.fillStyle = 'rgba(255,236,178,.38)';
  ctx.fillRect(p.x, p.y, p.w, 5);
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  ctx.fillRect(p.x, p.y + p.h - 6, p.w, 6);
  drawBlocks(ctx, p);
  drawCracks(ctx, p);
  drawUnderside(ctx, p);
}

function drawBlocks(ctx, p) {
  ctx.strokeStyle = 'rgba(0,0,0,.45)';
  ctx.lineWidth = 1;
  for (let x = p.x + 22; x < p.x + p.w; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, p.y + 7);
    ctx.lineTo(x + 12, p.y + p.h - 6);
    ctx.stroke();
  }
}

function drawCracks(ctx, p) {
  ctx.strokeStyle = 'rgba(15,12,10,.62)';
  for (let i = 0; i < Math.max(4, p.w / 80); i++) {
    const x = p.x + 15 + ((i * 67) % Math.max(20, p.w - 20));
    ctx.beginPath();
    ctx.moveTo(x, p.y + 8);
    ctx.lineTo(x + 8, p.y + 14);
    ctx.lineTo(x + 2, p.y + 22);
    ctx.stroke();
  }
}

function drawUnderside(ctx, p) {
  ctx.strokeStyle = 'rgba(0,0,0,.55)';
  for (let x = p.x + 12; x < p.x + p.w; x += 27) {
    ctx.beginPath();
    ctx.moveTo(x, p.y + p.h);
    ctx.lineTo(x + 8, p.y + p.h + 8 + (x % 13));
    ctx.stroke();
  }
}
