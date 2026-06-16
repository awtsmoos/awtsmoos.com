import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const files = {
'js/render/v3/character/CharacterStyle.js': `/**
 * B"H
 * V3 character style.
 *
 * Chapter 226: the Awtsmoos forms one readable hero covenant: tall, calm,
 * sculpted, never a broken circle puppet.
 */
export const V3_STYLE = Object.freeze({
  height: 178,
  shoulder: 78,
  hip: 32,
  head: Object.freeze({ rx: 22, ry: 24 }),
  neck: Object.freeze({ w: 16, h: 25 }),
  torso: Object.freeze({ top: 78, waist: 30, h: 72 }),
  arm: Object.freeze({ upper: 14, lower: 11 }),
  leg: Object.freeze({ thigh: 15, shin: 12 }),
  glove: Object.freeze({ rx: 10.5, ry: 10 }),
  boot: Object.freeze({ rx: 18, ry: 7 }),
  ring: Object.freeze({ rx: 35, ry: 6 })
});

export function material(color) {
  return { accent: color, shell: 'rgba(2,3,7,1)', soft: 'rgba(8,10,15,.98)', ink: 'rgba(0,0,0,.92)', glint: 'rgba(255,255,255,.72)' };
}
`,
'js/render/v3/character/CharacterDepth.js': `/** B"H — V3 depth: rear arm, legs, torso, front arm, head. */
export const backArm = face => face > 0 ? 'left' : 'right';
export const frontArm = face => face > 0 ? 'right' : 'left';
`,
'js/render/v3/character/CharacterRig.js': `/**
 * B"H
 * V3 character rig.
 *
 * Chapter 227: all animation points are authored first, then the rig guarantees
 * a tall vessel: feet below knees, helmet tied to neck, shoulders beyond hips.
 */
import { V3_STYLE } from './CharacterStyle.js';
export const pt = (x, y) => ({ x, y });
export const add = (p, x, y) => pt(p.x + x, p.y + y);
export const clamp = (n, a, b) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export const smooth = t => { const x = clamp(t, 0, 1); return x * x * (3 - 2 * x); };

export function baseRig(f) {
  const face = Math.sign(f.face || 1) || 1;
  const x = f.x, floor = f.y;
  const pelvis = pt(x, floor - 70);
  const chest = pt(x + face * 2, floor - 141);
  const sw = V3_STYLE.shoulder, hw = V3_STYLE.hip;
  return {
    face, floor, pelvis, chest,
    neck: pt(chest.x + face * 2, chest.y - 13),
    head: pt(chest.x + face * 4, floor - 172),
    leftShoulder: pt(chest.x - sw / 2, chest.y + 12),
    rightShoulder: pt(chest.x + sw / 2, chest.y + 12),
    leftHip: pt(pelvis.x - hw / 2, pelvis.y),
    rightHip: pt(pelvis.x + hw / 2, pelvis.y),
    leftElbow: pt(chest.x - 50, chest.y + 53),
    rightElbow: pt(chest.x + 50, chest.y + 53),
    leftHand: pt(chest.x - 44, chest.y + 79),
    rightHand: pt(chest.x + 44, chest.y + 79),
    leftKnee: pt(pelvis.x - 24, pelvis.y + 57),
    rightKnee: pt(pelvis.x + 24, pelvis.y + 57),
    leftFoot: pt(pelvis.x - 35, floor + 1),
    rightFoot: pt(pelvis.x + 35, floor + 1)
  };
}

export function guardRig(p) {
  p.neck = pt(p.chest.x + p.face * 2, p.chest.y - 13);
  p.head = pt(p.neck.x + p.face * 2, p.neck.y - 18);
  for (const side of ['left', 'right']) {
    const hip = p[side + 'Hip'];
    const knee = p[side + 'Knee'];
    const foot = p[side + 'Foot'];
    if (knee.y <= hip.y + 28) p[side + 'Knee'] = pt(knee.x, hip.y + 45);
    if (foot.y <= p[side + 'Knee'].y + 24) p[side + 'Foot'] = pt(foot.x, p[side + 'Knee'].y + 42);
  }
  return p;
}
`,
'js/render/v3/character/animation/Pose.js': `/** B"H — V3 pose helpers. */
export function poseName(f) {
  const a = f.attack || f.rapidAttack;
  if (a) return a.id?.includes('kick') || a.id === 'roundhouse' || a.id === 'meteorKick' ? 'kick' : 'punch';
  if ((f.stun || 0) > 0) return 'hitstun';
  if (!f.grounded) return (f.vy || 0) < 0 ? 'jump' : 'fall';
  if (Math.abs(f.vx || 0) > 0.9) return 'run';
  return 'idle';
}
`,
'js/render/v3/character/animation/PoseBlend.js': `/** B"H — V3 pose blend, reserved for authored transitions. */
export function copyPose(p) { return { ...p }; }
`,
'js/render/v3/character/animation/Idle.js': `/** B"H — V3 idle authored keyframe. */
import { add } from '../CharacterRig.js';
export function idle(p, f) {
  const b = Math.sin((f.motionClock || 0) * 0.009) * 0.45;
  p.chest = add(p.chest, 0, b); p.neck = add(p.neck, 0, b); p.head = add(p.head, 0, b);
  p.leftElbow = add(p.leftElbow, 5, -7); p.rightElbow = add(p.rightElbow, -5, -7);
  p.leftHand = add(p.leftHand, 8, -12); p.rightHand = add(p.rightHand, -8, -12);
  return p;
}
`,
'js/render/v3/character/animation/Run.js': `/** B"H — V3 run authored keyframe. */
import { add } from '../CharacterRig.js';
export function run(p, f) {
  const face = p.face, speed = Math.min(1, Math.abs(f.vx || 0) / 8);
  const phase = Math.sin((f.motionClock || 0) * 0.045) * speed;
  p.chest = add(p.chest, face * 2.2, -1.5); p.head = add(p.head, face * 2.8, -1.5);
  p.leftHand = add(p.leftHand, -face * phase * 9, -3); p.rightHand = add(p.rightHand, face * phase * 9, -3);
  p.leftKnee = add(p.leftKnee, face * phase * 8, -Math.max(0, phase) * 4);
  p.rightKnee = add(p.rightKnee, -face * phase * 8, -Math.max(0, -phase) * 4);
  p.leftFoot = add(p.leftFoot, face * phase * 10, -Math.max(0, phase) * 4);
  p.rightFoot = add(p.rightFoot, -face * phase * 10, -Math.max(0, -phase) * 4);
  return p;
}
`,
'js/render/v3/character/animation/Jump.js': `/** B"H — V3 jump authored keyframe. */
import { add } from '../CharacterRig.js';
export function jump(p) {
  p.chest = add(p.chest, 0, -4); p.head = add(p.head, 0, -4);
  p.leftKnee = add(p.leftKnee, -7, -6); p.rightKnee = add(p.rightKnee, 7, -6);
  p.leftFoot = add(p.leftFoot, -8, -3); p.rightFoot = add(p.rightFoot, 8, -3);
  return p;
}
`,
'js/render/v3/character/animation/Fall.js': `/** B"H — V3 fall authored keyframe. */
import { add } from '../CharacterRig.js';
export function fall(p) {
  p.leftHand = add(p.leftHand, -4, 3); p.rightHand = add(p.rightHand, 4, 3);
  p.leftFoot = add(p.leftFoot, -5, 3); p.rightFoot = add(p.rightFoot, 5, 3);
  return p;
}
`,
'js/render/v3/character/animation/Punch.js': `/** B"H — V3 punch authored keyframe. */
import { add, smooth } from '../CharacterRig.js';
export function punch(p, f) {
  const a = f.attack || f.rapidAttack || {}, face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = Math.max(a.rapid ? 0.35 : 0.28, smooth(raw * 0.22 / span));
  const side = face > 0 ? 'right' : 'left', other = side === 'right' ? 'left' : 'right';
  const reach = a.fullCharge ? 54 : a.rapid ? 36 : 46;
  p.chest = add(p.chest, face * 1.8 * t, -0.8); p.head = add(p.head, face * 1.2 * t, 0);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.48, 19);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 19);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 11, 43);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 16, 68);
  return p;
}
`,
'js/render/v3/character/animation/Kick.js': `/** B"H — V3 kick authored keyframe. */
import { add, smooth } from '../CharacterRig.js';
export function kick(p, f) {
  const a = f.attack || {}, face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 8) + (a.recovery || 8));
  const t = Math.max(0.4, smooth((f.attackFrame || 0) * 0.22 / span));
  const side = face > 0 ? 'right' : 'left', other = side === 'right' ? 'left' : 'right';
  const reach = a.fullCharge ? 66 : 56;
  p.chest = add(p.chest, -face * 2.5, -2); p.head = add(p.head, -face * 1.5, -2);
  p.leftHand = add(p.leftHand, -face * 6, -7); p.rightHand = add(p.rightHand, -face * 6, -7);
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * 0.44, -26);
  p[side + 'Foot'] = add(p[side + 'Hip'], face * reach * t, -36);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 8, 52);
  p[other + 'Foot'] = add(p[other + 'Hip'], -face * 18, 66);
  return p;
}
`,
'js/render/v3/character/animation/Charge.js': `/** B"H — V3 charge keyframe. */
import { add } from '../CharacterRig.js';
export function charge(p) { p.leftHand = add(p.leftHand, 0, -6); p.rightHand = add(p.rightHand, 0, -6); return p; }
`,
'js/render/v3/character/animation/Hitstun.js': `/** B"H — V3 hitstun, small recoil only. */
import { add } from '../CharacterRig.js';
export function hitstun(p, f) {
  const force = Math.max(Math.min(1, (f.stun || 0) / 60), Math.min(1, (f.damage || 0) / 240) * 0.1);
  const away = Math.sign(f.vx || -p.face) || -p.face;
  p.chest = add(p.chest, away * force * 4, force * 2); p.head = add(p.head, away * force * 5, -force * 1.5);
  p.leftHand = add(p.leftHand, away * force * 4, force * 2); p.rightHand = add(p.rightHand, away * force * 4, force * 2);
  return p;
}
`,
'js/render/v3/character/animation/Launch.js': `/** B"H — V3 launch keyframe. */
export { hitstun as launch } from './Hitstun.js';
`,
'js/render/v3/character/animation/Knockout.js': `/** B"H — V3 knockout placeholder; hidden fighters are skipped by renderer. */
export function knockout(p) { return p; }
`,
'js/render/v3/character/animation/AnimationController.js': `/**
 * B"H
 * V3 animation controller.
 *
 * Chapter 228: no procedural flailing. One authored chapter is chosen and then
 * guarded, so attacks may be readable without tearing the vessel.
 */
import { baseRig, guardRig } from '../CharacterRig.js';
import { poseName } from './Pose.js';
import { idle } from './Idle.js';
import { run } from './Run.js';
import { jump } from './Jump.js';
import { fall } from './Fall.js';
import { punch } from './Punch.js';
import { kick } from './Kick.js';
import { charge } from './Charge.js';
import { hitstun } from './Hitstun.js';

export function resolvePose(f) {
  let p = baseRig(f);
  const name = poseName(f);
  if (name === 'run') p = run(p, f);
  else if (name === 'jump') p = jump(p, f);
  else if (name === 'fall') p = fall(p, f);
  else if (name === 'punch') p = punch(p, f);
  else if (name === 'kick') p = kick(p, f);
  else if (name === 'hitstun') p = hitstun(p, f);
  else p = idle(p, f);
  if (f.chargeGlow && !f.attack && !f.rapidAttack) p = charge(p, f);
  return guardRig(p);
}
`,
'js/render/v3/character/body/Shape.js': `/** B"H — V3 body primitive helpers. */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
export function segment(ctx, a, b, width, mat, dark = false) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy); if (len < 2) return;
  ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = dark ? mat.soft : mat.accent; ctx.strokeStyle = mat.ink; ctx.lineWidth = 2;
  roundRect(ctx, 0, -width / 2, len, width, width / 2); ctx.fill(); ctx.stroke(); ctx.restore();
}
`,
'js/render/v3/character/body/Helmet.js': `/** B"H — V3 helmet shell. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawHelmet(ctx, p, mat) {
  ctx.save(); ctx.translate(p.head.x, p.head.y);
  const g = ctx.createRadialGradient(-7, -10, 3, 0, 0, V3_STYLE.head.ry);
  g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.3, mat.soft); g.addColorStop(1, mat.shell);
  ctx.fillStyle = g; ctx.strokeStyle = mat.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, V3_STYLE.head.rx, V3_STYLE.head.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}
`,
'js/render/v3/character/body/Visor.js': `/** B"H — V3 visor blade. */
export function drawVisor(ctx, p, mat) {
  const face = p.face; ctx.save(); ctx.translate(p.head.x, p.head.y);
  ctx.fillStyle = mat.accent; ctx.strokeStyle = mat.ink; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-15, -2); ctx.quadraticCurveTo(face * 2, 8, face * 18, -7); ctx.lineTo(face * 14, 4);
  ctx.quadraticCurveTo(0, 11, -14, 5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
`,
'js/render/v3/character/body/Neck.js': `/** B"H — V3 attached neck. */
import { V3_STYLE } from '../CharacterStyle.js';
import { roundRect } from './Shape.js';
export function drawNeck(ctx, p, mat) {
  ctx.fillStyle = mat.shell; ctx.strokeStyle = mat.accent; ctx.lineWidth = 2;
  roundRect(ctx, p.neck.x - V3_STYLE.neck.w / 2, p.neck.y - 1, V3_STYLE.neck.w, V3_STYLE.neck.h, 8); ctx.fill(); ctx.stroke();
}
`,
'js/render/v3/character/body/Chest.js': `/** B"H — V3 tapered chest. */
export function drawChest(ctx, p, mat) {
  ctx.fillStyle = mat.shell; ctx.strokeStyle = mat.accent; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(p.leftShoulder.x - 8, p.leftShoulder.y);
  ctx.quadraticCurveTo(p.chest.x, p.chest.y - 18, p.rightShoulder.x + 8, p.rightShoulder.y);
  ctx.quadraticCurveTo(p.chest.x + 26, p.pelvis.y - 34, p.rightHip.x + 12, p.rightHip.y + 7);
  ctx.quadraticCurveTo(p.pelvis.x, p.pelvis.y + 14, p.leftHip.x - 12, p.leftHip.y + 7);
  ctx.quadraticCurveTo(p.chest.x - 26, p.pelvis.y - 34, p.leftShoulder.x - 8, p.leftShoulder.y); ctx.closePath(); ctx.fill(); ctx.stroke();
}
`,
'js/render/v3/character/body/Waist.js': `/** B"H — V3 waist accent. */
export function drawWaist(ctx, p, mat) { ctx.save(); ctx.strokeStyle = mat.accent; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(p.leftHip.x - 8, p.leftHip.y + 4); ctx.lineTo(p.rightHip.x + 8, p.rightHip.y + 4); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/character/body/Shoulder.js': `/** B"H — V3 flat shoulder pads. */
export function drawShoulders(ctx, p, mat) { cap(ctx, p.leftShoulder, -1, mat); cap(ctx, p.rightShoulder, 1, mat); }
function cap(ctx, c, sign, mat) { ctx.save(); ctx.translate(c.x + sign * 2, c.y + 5); ctx.rotate(sign * .16); ctx.fillStyle = mat.soft; ctx.strokeStyle = mat.accent; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.ellipse(0,0,11,5.5,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/character/body/UpperArm.js': `/** B"H — V3 upper arm. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawUpperArm(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.arm.upper, mat, true); }
`,
'js/render/v3/character/body/Forearm.js': `/** B"H — V3 forearm. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawForearm(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.arm.lower, mat, false); }
`,
'js/render/v3/character/body/Glove.js': `/** B"H — V3 glove, compact not blob. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawGlove(ctx, h, mat) { ctx.save(); ctx.translate(h.x,h.y); ctx.fillStyle=mat.accent; ctx.strokeStyle=mat.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(0,0,V3_STYLE.glove.rx,V3_STYLE.glove.ry,-.1,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/character/body/Thigh.js': `/** B"H — V3 thigh. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawThigh(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.leg.thigh, mat, true); }
`,
'js/render/v3/character/body/Shin.js': `/** B"H — V3 shin. */
import { segment } from './Shape.js';
import { V3_STYLE } from '../CharacterStyle.js';
export function drawShin(ctx, a, b, mat) { segment(ctx, a, b, V3_STYLE.leg.shin, mat, false); }
`,
'js/render/v3/character/body/Boot.js': `/** B"H — V3 boot, smaller planted foot. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawBoot(ctx, foot, sign, mat) { ctx.save(); ctx.translate(foot.x,foot.y); ctx.rotate(sign*.04); ctx.fillStyle=mat.accent; ctx.strokeStyle=mat.ink; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(sign*3,0,V3_STYLE.boot.rx,V3_STYLE.boot.ry,0,0,Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/character/body/GroundRing.js': `/** B"H — V3 ground ring. */
import { V3_STYLE } from '../CharacterStyle.js';
export function drawGroundRing(ctx, p, color, human) { ctx.save(); ctx.globalAlpha=human?.75:.32; ctx.strokeStyle=color; ctx.lineWidth=human?3:2; ctx.beginPath(); ctx.ellipse(p.pelvis.x, Math.max(p.leftFoot.y,p.rightFoot.y)+4, V3_STYLE.ring.rx, V3_STYLE.ring.ry, 0,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/character/CharacterRenderer.js': `/**
 * B"H
 * V3 character renderer.
 *
 * Chapter 229: no capsule body is drawn. Sculpted modules draw the hero in
 * layers: ring, legs, rear arm, torso, front arm, helmet and visor.
 */
import { material } from './CharacterStyle.js';
import { backArm, frontArm } from './CharacterDepth.js';
import { resolvePose } from './animation/AnimationController.js';
import { drawGroundRing } from './body/GroundRing.js';
import { drawThigh } from './body/Thigh.js';
import { drawShin } from './body/Shin.js';
import { drawBoot } from './body/Boot.js';
import { drawUpperArm } from './body/UpperArm.js';
import { drawForearm } from './body/Forearm.js';
import { drawGlove } from './body/Glove.js';
import { drawNeck } from './body/Neck.js';
import { drawChest } from './body/Chest.js';
import { drawWaist } from './body/Waist.js';
import { drawShoulders } from './body/Shoulder.js';
import { drawHelmet } from './body/Helmet.js';
import { drawVisor } from './body/Visor.js';
import { drawChargeGlow } from '../effects/ChargeGlow.js';
import { drawHitSpark } from '../effects/HitSpark.js';

export function drawCharacter(ctx, f, color) {
  const p = resolvePose(f);
  const mat = material(color);
  drawChargeGlow(ctx, f, p, color);
  drawGroundRing(ctx, p, color, f.human);
  leg(ctx, p, mat, 'left', -1); leg(ctx, p, mat, 'right', 1);
  arm(ctx, p, mat, backArm(p.face));
  drawNeck(ctx, p, mat); drawChest(ctx, p, mat); drawShoulders(ctx, p, mat); drawWaist(ctx, p, mat);
  arm(ctx, p, mat, frontArm(p.face));
  drawHelmet(ctx, p, mat); drawVisor(ctx, p, mat);
  drawHitSpark(ctx, f, p, color);
}
function arm(ctx, p, mat, side) { drawUpperArm(ctx, p[side+'Shoulder'], p[side+'Elbow'], mat); drawForearm(ctx, p[side+'Elbow'], p[side+'Hand'], mat); drawGlove(ctx, p[side+'Hand'], mat); }
function leg(ctx, p, mat, side, sign) { drawThigh(ctx, p[side+'Hip'], p[side+'Knee'], mat); drawShin(ctx, p[side+'Knee'], p[side+'Foot'], mat); drawBoot(ctx, p[side+'Foot'], sign, mat); }
`,
'js/render/v3/effects/HitSpark.js': `/** B"H — V3 tiny hit spark only; never covers body. */
export function drawHitSpark(ctx, f, p, color) { if (!f.stun || f.stun < 4) return; ctx.save(); ctx.globalAlpha=.45; ctx.strokeStyle=color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(p.chest.x-8,p.chest.y-4); ctx.lineTo(p.chest.x+8,p.chest.y+4); ctx.moveTo(p.chest.x+8,p.chest.y-4); ctx.lineTo(p.chest.x-8,p.chest.y+4); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/effects/PunchTrail.js': `/** B"H — V3 minimal punch trail. */
export function drawPunchTrail() {}
`,
'js/render/v3/effects/KickTrail.js': `/** B"H — V3 minimal kick trail. */
export function drawKickTrail() {}
`,
'js/render/v3/effects/ChargeGlow.js': `/** B"H — V3 soft charge glow. */
export function drawChargeGlow(ctx, f, p, color) { if (!f.chargeGlow && !f.attack?.fullCharge) return; ctx.save(); ctx.globalAlpha=.12; ctx.strokeStyle=color; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(p.chest.x,p.chest.y+40,38,55,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
`,
'js/render/v3/effects/LandingDust.js': `/** B"H — V3 landing dust placeholder, intentionally quiet. */
export function drawLandingDust() {}
`,
'js/render/v3/effects/StunFlash.js': `/** B"H — V3 stun flash placeholder, intentionally quiet. */
export function drawStunFlash() {}
`,
'js/render/v3/hud/StockDots.js': `/** B"H — V3 stock dots. */
export function drawStockDots(ctx, f, x, y, color) { const n=Math.max(0,f.stocks||0); for(let i=0;i<3;i++){ctx.globalAlpha=i<n?1:.18; ctx.fillStyle=i<n?color:'#fff'; ctx.beginPath(); ctx.arc(x+i*8,y,2.6,0,Math.PI*2); ctx.fill();} ctx.globalAlpha=1; }
`,
'js/render/v3/hud/PlayerCard.js': `/** B"H — V3 readable player card. */
import { drawStockDots } from './StockDots.js';
function hue(f){return 'hsl('+f.dna.hue+' 90% 60%)';}
export function drawPlayerCard(ctx, f, x, y, w) { const c=hue(f), pct=Math.round(f.damage); ctx.save(); ctx.fillStyle='rgba(4,3,10,.58)'; ctx.strokeStyle=c; ctx.lineWidth=1.5; round(ctx,x,y,w,42,10); ctx.fill(); ctx.stroke(); ctx.font='950 10px system-ui'; ctx.fillStyle=f.human?'#69ffff':c; ctx.fillText(f.human?'YOU':f.name.replace('Bot ','B'),x+7,y+12); ctx.font='950 20px system-ui'; ctx.fillStyle=pct>=120?'#ff866b':pct>=70?'#ffe27a':'#fff'; ctx.strokeStyle='#000'; ctx.lineWidth=3; ctx.strokeText(f.dead?'OUT':pct+'%',x+7,y+33); ctx.fillText(f.dead?'OUT':pct+'%',x+7,y+33); drawStockDots(ctx,f,x+w-28,y+31,c); ctx.restore(); }
function round(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
`,
'js/render/v3/hud/TopDamageBar.js': `/** B"H — V3 top damage bar is primary UI. */
import { drawPlayerCard } from './PlayerCard.js';
export function drawTopDamageBar(ctx, state, w) { const fighters=state.fighters.slice(0,5); const pad=8, gap=6; const cw=Math.max(66, Math.min(96,(w-pad*2-gap*(fighters.length-1))/Math.max(1,fighters.length))); fighters.forEach((f,i)=>drawPlayerCard(ctx,f,pad+i*(cw+gap),8,cw)); }
`,
'js/render/v3/hud/OffscreenArrow.js': `/** B"H — V3 quiet offscreen arrows. */
export function drawOffscreenArrow(ctx,x,y,angle,color){ctx.save();ctx.globalAlpha=.32;ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-4,-5);ctx.lineTo(-2,0);ctx.lineTo(-4,5);ctx.closePath();ctx.fill();ctx.restore();}
`,
'js/render/v3/hud/MobileHud.js': `/** B"H — V3 mobile HUD. */
import { drawTopDamageBar } from './TopDamageBar.js';
export function drawMobileHud(ctx, state, w) { drawTopDamageBar(ctx, state, w); }
`,
'js/render/v3/hud/DesktopHud.js': `/** B"H — V3 desktop HUD reuses top damage cards. */
import { drawTopDamageBar } from './TopDamageBar.js';
export function drawDesktopHud(ctx, state, w) { drawTopDamageBar(ctx, state, w); }
`,
'js/render/v3/hud/TouchControls.js': `/** B"H — CSS owns touch controls; this file marks v3 ownership. */
export function touchControlsV3() { return true; }
`,
'js/render/v3/hud/MobileLayout.js': `/** B"H — V3 mobile layout constants. */
export const MOBILE_SAFE_TOP = 58;
`,
'js/render/v3/stage/PlatformRenderer.js': `/** B"H — V3 platform renderer placeholder; existing stage remains compatible. */
export function drawV3Platform() {}
`,
'js/render/v3/stage/PlatformShadow.js': `/** B"H — V3 platform shadow placeholder. */
export function drawPlatformShadow() {}
`,
'js/render/v3/stage/CameraFraming.js': `/** B"H — V3 camera target helper. */
export function desiredFighterScreenHeight() { return 178; }
`,
'js/render/v3/hud/index.js': `/** B"H — V3 HUD entry. */
import { drawMobileHud } from './MobileHud.js';
import { drawDesktopHud } from './DesktopHud.js';
export function drawV3Hud(ctx, state, w, h) { w < 760 ? drawMobileHud(ctx, state, w, h) : drawDesktopHud(ctx, state, w, h); }
`,
'js/render/fighters.js': `/**
 * B"H
 * V3-only fighter renderer.
 *
 * Chapter 230: old capsule visuals are not drawn. The new sculpted v3 hero is
 * the primary body; effects are quiet; labels stay small and above.
 */
import { fighterColor } from './fighter/colors.js';
import { drawLabels } from './fighter/labels.js';
import { drawShield } from './fighter/auras.js';
import { drawCharacter } from './v3/character/CharacterRenderer.js';

export function drawFighters(ctx, fighters) {
  for (const f of fighters) drawFighter(ctx, f);
}

function drawFighter(ctx, f) {
  if (f.dead || f.hidden || f.respawnTimer) return;
  const color = fighterColor(f);
  drawCharacter(ctx, f, color);
  drawLabels(ctx, f);
  if (f.blocking) drawShield(ctx, f);
}
`,
'js/render/ui.js': `/**
 * B"H
 * V3 UI renderer.
 *
 * Chapter 231: top damage cards become the primary hierarchy. Bottom damage HUD
 * is gone; controls remain CSS-owned and readable.
 */
import { drawV3Hud } from './v3/hud/index.js';
import { drawOffscreenArrow } from './v3/hud/OffscreenArrow.js';

export function drawUi(ctx, state, w, h = innerHeight) {
  drawV3Hud(ctx, state, w, h);
  drawOffscreenFighterBeacons(ctx, state, w, h, w < 760);
  drawRespawnCountdown(ctx, state, w, h);
  if (state.winner) drawWinner(ctx, state, w, h);
}

function drawOffscreenFighterBeacons(ctx, state, w, h, mobile) {
  if (!state.camera) return;
  const top = mobile ? 62 : 58, bottom = h - 92;
  for (const f of state.fighters) {
    if (!f || f.dead || f.hidden || (f.human && !state.camera.spectating)) continue;
    const s = worldToScreen(f, state.camera, w, h);
    if (s.x > 18 && s.x < w - 18 && s.y > top && s.y < bottom) continue;
    const x = Math.max(18, Math.min(w - 18, s.x));
    const y = Math.max(top, Math.min(bottom, s.y));
    drawOffscreenArrow(ctx, x, y, Math.atan2(s.y - y, s.x - x), 'hsl(' + f.dna.hue + ' 90% 60%)');
  }
}
function worldToScreen(f, camera, w, h) { const z = camera.zoom || 1; return { x: w / 2 + z * (f.x + camera.x - w / 2), y: h / 2 + z * (f.y - 95 + camera.y - h / 2) }; }
function drawRespawnCountdown(ctx, state, w, h) { const f = state.fighters.find(item => item.human && item.respawnTimer > 0 && !item.dead); if (!f) return; const n = Math.max(1, Math.ceil(f.respawnTimer / 30)); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(w / 2, h * 0.44, 54, 0, Math.PI * 2); ctx.fill(); ctx.font = '950 48px system-ui'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff2a8'; ctx.fillText(String(n), w / 2, h * 0.44 + 17); ctx.restore(); }
function drawWinner(ctx, state, w, h) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.84)'; ctx.fillRect(w / 2 - 160, h / 2 - 38, 320, 76); ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 28px system-ui'; ctx.textAlign = 'center'; ctx.fillText(state.winner + ' wins', w / 2, h / 2 + 10); ctx.restore(); }
`
};

for (const [path, content] of Object.entries(files)) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}
console.log(JSON.stringify({ ok: true, wrote: Object.keys(files).length }, null, 2));
