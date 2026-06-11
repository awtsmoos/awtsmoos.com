import { withGlow, radialGlow } from './lighting/glow.js';

/**
 * B"H
 * Fighter renderer, repaired toward readable humanoids.
 *
 * Chapter 63: bodies now announce state. Danger leaks letters, air-dodge turns
 * the silhouette into a streak, fast-fall sharpens posture, and combo heat
 * lights the fighter who is currently writing violence into the arena.
 */
export function drawFighters(ctx, fighters) {
  for (const fighter of fighters) drawFighter(ctx, fighter);
}

function drawFighter(ctx, f) {
  if (f.dead) return;
  const color = `hsl(${f.dna.hue} 90% 62%)`;
  const lean = computeLean(f);
  if (f.human) drawPlayerRing(ctx, f, color);
  if (f.danger) drawDangerAura(ctx, f);
  if (f.airDodge) drawDodgeStreak(ctx, f, color);
  drawBodyMass(ctx, f, color, lean);
  withGlow(ctx, color, f.combo?.count > 2 ? 18 : 10, () => drawLimbs(ctx, f, color));
  drawHandsFeet(ctx, f, color);
  drawHead(ctx, f, color, lean);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
  if (f.attack) drawAttackArc(ctx, f, color);
}

function computeLean(f) {
  return Math.max(-0.42, Math.min(0.42, f.vx * 0.035 + (f.fastFalling ? f.face * 0.18 : 0)));
}

function drawPlayerRing(ctx, f, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(f.x, f.y + 4, 50, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  drawOutlinedText(ctx, 'YOU', f.x, f.y - 184, 18, '#fff7b5');
}

function drawDangerAura(ctx, f) {
  const pulse = 34 + Math.sin((f.motionClock || 0) * 0.18) * 8;
  radialGlow(ctx, f.x, f.y - 92, pulse, '#ffcf55aa');
  drawOutlinedText(ctx, 'סכנה', f.x, f.y - 210, 18, '#ffdf70');
}

function drawDodgeStreak(ctx, f, color) {
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(f.x - f.vx * 4, f.y - 95 - f.vy * 2);
  ctx.lineTo(f.x, f.y - 95);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawBodyMass(ctx, f, color, lean) {
  const spine = f.bones.spine;
  const chest = spine?.tip || { x: f.x, y: f.y - 128 };
  const hip = spine?.root || { x: f.x, y: f.y - 56 };
  ctx.fillStyle = 'rgba(0,0,0,.84)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.save();
  ctx.translate(chest.x, chest.y + 34);
  ctx.rotate(lean);
  ctx.beginPath();
  ctx.ellipse(0, 0, 22, 45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.beginPath();
  ctx.ellipse(hip.x, hip.y + 6, 25, 13, lean * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawLimbs(ctx, f, color) {
  ctx.lineCap = 'round';
  drawSkeletonLayer(ctx, f, 'rgba(0,0,0,.92)', 14);
  drawSkeletonLayer(ctx, f, color, 7);
  drawJointLine(ctx, f.bones.leftShoulder, f.bones.rightShoulder, color);
  drawJointLine(ctx, f.bones.leftThigh, f.bones.rightThigh, color);
}

function drawSkeletonLayer(ctx, f, stroke, width) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  for (const bone of Object.values(f.bones)) drawBoneLine(ctx, bone);
}

function drawBoneLine(ctx, bone) {
  if (!bone || bone.id === 'root' || bone.id === 'head') return;
  ctx.beginPath();
  ctx.moveTo(bone.root.x, bone.root.y);
  ctx.lineTo(bone.tip.x, bone.tip.y);
  ctx.stroke();
}

function drawJointLine(ctx, a, b, color) {
  if (!a || !b) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(a.root.x, a.root.y);
  ctx.lineTo(b.root.x, b.root.y);
  ctx.stroke();
}

function drawHandsFeet(ctx, f, color) {
  ctx.fillStyle = color;
  for (const id of ['leftLowerArm', 'rightLowerArm']) drawOvalTip(ctx, f.bones[id], 7, 5);
  for (const id of ['leftCalf', 'rightCalf']) drawOvalTip(ctx, f.bones[id], 11, 5);
}

function drawOvalTip(ctx, bone, rx, ry) {
  if (!bone) return;
  ctx.beginPath();
  ctx.ellipse(bone.tip.x, bone.tip.y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHead(ctx, f, color, lean) {
  const head = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
  ctx.fillStyle = '#080609';
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(head.x + lean * 8, head.y, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = f.danger ? '#fff2a8' : color;
  ctx.beginPath();
  ctx.arc(head.x + lean * 8 + f.face * 6, head.y - 2, f.danger ? 3.8 : 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawLabels(ctx, f) {
  const head = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
  const text = `${f.human ? 'YOU' : f.name} ${Math.round(100 - Math.min(100, f.damage / 1.8))}HP S${f.stocks}`;
  drawOutlinedText(ctx, text, f.x, head.y - 34, 12, '#fff7c9');
  if (f.combo?.count > 2) drawOutlinedText(ctx, `${f.combo.count}x`, f.x + 42, head.y - 54, 16, '#fff4a8');
}

function drawOutlinedText(ctx, text, x, y, size, fill) {
  ctx.font = `900 ${size}px system-ui`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function drawShield(ctx, f) {
  ctx.strokeStyle = '#9affc5cc';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(f.x + f.face * 22, f.y - 82, 46, 0, Math.PI * 2);
  ctx.stroke();
}

function drawAttackArc(ctx, f, color) {
  const hand = f.bones.rightLowerArm?.tip || { x: f.x + f.face * 50, y: f.y - 90 };
  radialGlow(ctx, hand.x, hand.y, 50, color.replace('hsl', 'hsla').replace(')', ' / .45)'));
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(f.x + f.face * 50, f.y - 95, 55, -0.8, 0.8);
  ctx.stroke();
}
