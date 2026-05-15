/**
 * B"H
 * @module BattleGlyphs
 */
const pulse = () => 1 + Math.sin(performance.now() / 220) * 0.06;

export const drawOpponentGlyph = (ctx, glyph, x, y, size) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(pulse(), pulse());
  ctx.fillStyle = 'rgba(179,136,255,.25)';
  ctx.beginPath();
  ctx.ellipse(0, size * .38, size * .72, size * .18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#7e57c2';
  ctx.beginPath();
  ctx.arc(0, 0, size * .45, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e1bee7';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#fffde7';
  ctx.font = `bold ${Math.floor(size * .55)}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph || '?', 0, 2);
  ctx.restore();
};

export const drawPlayerGlyph = (ctx, stats, x, y, size) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(77,208,225,.22)';
  ctx.beginPath();
  ctx.ellipse(0, size * .42, size * .8, size * .18, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1565c0';
  ctx.beginPath();
  ctx.roundRect(-size * .32, -size * .18, size * .64, size * .78, size * .12);
  ctx.fill();

  ctx.fillStyle = '#ffdbac';
  ctx.beginPath();
  ctx.arc(0, -size * .35, size * .24, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff8e1';
  ctx.font = `bold ${Math.floor(size * .28)}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText(stats.garment?.icon || '*', 0, size * .18);
  ctx.restore();
};
