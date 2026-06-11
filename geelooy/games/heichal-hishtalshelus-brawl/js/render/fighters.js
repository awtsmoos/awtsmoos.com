import { withGlow, radialGlow } from './lighting/glow.js';

/**
 * B"H — Fighters become closer to the mockup: glowing joints, layered bones,
 * readable names, shield halos, and small sefirotic sparks at hands/weapons.
 */
export function drawFighters(ctx, fighters) {
  for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, f) {
  if (f.dead) return;
  const color = `hsl(${f.dna.hue} 90% 62%)`;
  withGlow(ctx, color, 12, () => drawBones(ctx, f, color));
  drawJoints(ctx, f, color);
  drawHead(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
  if (f.attack) drawAttackSpark(ctx, f, color);
}

function drawBones(ctx, f, color) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 9;
  ctx.strokeStyle = 'rgba(0,0,0,.72)';
  for (const b of Object.values(f.bones)) drawBoneLine(ctx, b);
  ctx.lineWidth = 5;
  ctx.strokeStyle = color;
  for (const b of Object.values(f.bones)) drawBoneLine(ctx, b);
}

function drawBoneLine(ctx, b) {
  if (b.id === 'root') return;
  ctx.beginPath();
  ctx.moveTo(b.root.x, b.root.y);
  ctx.lineTo(b.tip.x, b.tip.y);
  ctx.stroke();
}

function drawJoints(ctx, f, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#090909';
  ctx.lineWidth = 2;
  for (const b of Object.values(f.bones)) {
    ctx.beginPath();
    ctx.arc(b.tip.x, b.tip.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawHead(ctx, f, color) {
  ctx.fillStyle = '#0b0b0b';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(f.x, f.y - 94 * f.dna.height, 16 * f.dna.height, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawLabels(ctx, f) {
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 4;
  const text = `${f.name}  ${Math.round(f.damage)}%  S${f.stocks}`;
  ctx.strokeText(text, f.x, f.y - 125);
  ctx.fillStyle = '#fff7c9';
  ctx.fillText(text, f.x, f.y - 125);
}

function drawShield(ctx, f) {
  ctx.strokeStyle = '#9affc5aa';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(f.x, f.y - 50, 52, 0, Math.PI * 2);
  ctx.stroke();
}

function drawAttackSpark(ctx, f, color) {
  radialGlow(ctx, f.x + f.face * 45, f.y - 55, 34, color.replace('hsl', 'hsla').replace(')', ' / .45)'));
}
