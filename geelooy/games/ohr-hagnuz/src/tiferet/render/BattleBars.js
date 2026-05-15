/**
 * B"H
 * @module BattleBars
 */
export const clamp01 = value => Math.max(0, Math.min(1, value || 0));

export const drawBar = (ctx, x, y, w, h, ratio, label, fill = '#66bb6a') => {
  const r = clamp01(ratio);
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 3, y + 3, Math.max(0, (w - 6) * r), h - 6);
  ctx.fillStyle = '#fffde7';
  ctx.font = 'bold 13px monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y + h / 2);
  ctx.restore();
};

export const drawPanel = (ctx, x, y, w, h, title) => {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, 'rgba(21,21,46,.94)');
  g.addColorStop(1, 'rgba(54,26,76,.92)');
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(255,245,157,.75)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(title, x + 18, y + 30);
  ctx.restore();
};
