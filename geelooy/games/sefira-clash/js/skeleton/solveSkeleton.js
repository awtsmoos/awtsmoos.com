import { animationState } from './animationState.js';

/**
 * B"H
 * Humanoid animation solver with analog-vector combat posing.
 *
 * Chapter 282: the limb follows the kav of the joystick. Punches extend along
 * the exact vector. Kicks throw the leg along the exact vector while the torso
 * twists around it, so diagonal, up, down, and side attacks are visibly true.
 */
export function solveSkeleton(f) {
  const a = animationState(f);
  f.anim = a;
  const s = Math.max(0.9, Math.min(1.15, f.dna.height || 1));
  const facing = f.face || 1;
  const speed = Math.min(1.25, Math.abs(f.vx) / 10);
  const direction = Math.sign(f.vx || facing || 1);
  const clock = f.motionClock || 0;
  const walk = Math.sin(clock * 0.42) * speed * direction;
  const base = basePose(f, facing, walk, s, a);
  const posed = statePose(a, base, facing, s);
  bindAll(f, actionPose(f, posed, facing, s));
}

function basePose(f, facing, walk, s, a) {
  const squat = a.squash * 42 * s;
  const stretch = a.stretch * 38 * s;
  const hip = point(f.x, f.y - 56 * s + squat * 0.6);
  const chest = point(f.x + facing * 4 + walk * 4, f.y - 128 * s + squat - stretch);
  const neck = point(chest.x, chest.y - 13 * s);
  const head = point(chest.x + facing * Math.abs(f.vx) * 0.35, chest.y - 42 * s - stretch * 0.22);
  const sw = 31 * s;
  const hw = 18 * s;
  return {
    hip, chest, neck, head,
    leftShoulder: point(chest.x - sw, chest.y + 14 * s),
    rightShoulder: point(chest.x + sw, chest.y + 14 * s),
    leftHip: point(hip.x - hw, hip.y + 3 * s),
    rightHip: point(hip.x + hw, hip.y + 3 * s),
    leftElbow: point(chest.x - sw - 18 * s - walk * 18 * s, chest.y + 52 * s),
    leftHand: point(chest.x - sw - 26 * s - walk * 32 * s, chest.y + 90 * s),
    rightElbow: point(chest.x + sw + 18 * s + walk * 18 * s, chest.y + 52 * s),
    rightHand: point(chest.x + sw + 26 * s + walk * 32 * s, chest.y + 90 * s),
    leftKnee: point(hip.x - hw - walk * 27 * s, hip.y + 53 * s),
    leftFoot: point(hip.x - hw - walk * 42 * s, f.y + 2),
    rightKnee: point(hip.x + hw + walk * 27 * s, hip.y + 53 * s),
    rightFoot: point(hip.x + hw + walk * 42 * s, f.y + 2)
  };
}

function statePose(a, p, facing, s) {
  if (a.kind === 'squat') crouchPose(p, s);
  else if (a.kind === 'rise') risePose(p, facing, s);
  else if (a.kind === 'apex') apexPose(p, facing, s);
  else if (a.kind === 'fall') fallPose(p, facing, s);
  else if (a.kind === 'fastFall') fastFallPose(p, facing, s);
  else if (a.kind === 'landing') crouchPose(p, s * 1.25);
  else if (a.kind === 'hitstun') hitstunPose(p, facing, s);
  else if (a.kind === 'ledgeHang') ledgePose(p, facing, s);
  else if (a.kind === 'charge' || a.kind === 'maxCharge') chargePose(p, facing, s, a.charge);
  return p;
}

function crouchPose(p, s) {
  p.chest.y += 22 * s; p.head.y += 20 * s;
  p.leftKnee.y += 18 * s; p.rightKnee.y += 18 * s;
  p.leftFoot.x -= 10 * s; p.rightFoot.x += 10 * s;
  p.leftHand.y += 18 * s; p.rightHand.y += 18 * s;
}

function risePose(p, facing, s) {
  p.leftHand.y -= 28 * s; p.rightHand.y -= 32 * s;
  p.leftFoot.x -= facing * 14 * s; p.rightFoot.x -= facing * 6 * s;
  p.leftKnee.y -= 10 * s; p.rightKnee.y -= 6 * s;
}

function apexPose(p, facing, s) {
  p.leftHand.x -= facing * 18 * s; p.rightHand.x += facing * 18 * s;
  p.leftKnee.y += 8 * s; p.rightKnee.y += 8 * s;
}

function fallPose(p, facing, s) {
  p.chest.x += facing * 6 * s;
  p.leftHand.y += 22 * s; p.rightHand.y += 18 * s;
  p.leftFoot.y += 8 * s; p.rightFoot.y += 8 * s;
}

function fastFallPose(p, facing, s) {
  p.chest.x += facing * 14 * s; p.head.x += facing * 10 * s;
  p.leftHand.y += 38 * s; p.rightHand.y += 38 * s;
  p.leftFoot.y -= 10 * s; p.rightFoot.y -= 4 * s;
}

function hitstunPose(p, facing, s) {
  p.chest.x -= facing * 18 * s; p.head.x -= facing * 22 * s;
  p.leftHand.x -= facing * 42 * s; p.rightHand.x -= facing * 32 * s;
}

function ledgePose(p, facing, s) {
  p.chest.y += 44 * s; p.head.y += 42 * s;
  p.rightHand.x += facing * 34 * s; p.rightHand.y -= 60 * s;
  p.leftHand.y -= 16 * s; p.leftFoot.y += 35 * s; p.rightFoot.y += 35 * s;
}

function chargePose(p, facing, s, charge) {
  const tremble = Math.sin((charge * 40) + p.chest.x * 0.03) * charge * 7 * s;
  p.chest.x -= facing * (8 + charge * 12) * s;
  p.rightHand.x += facing * (14 + charge * 16) * s;
  p.leftHand.x += tremble;
  p.rightHand.x -= tremble;
}

function actionPose(f, p, facing, s) {
  const id = f.blocking ? 'shield' : f.attack?.id || '';
  const aim = exactAim(f.attack?.aim, facing);
  const t = attackPhase(f);
  if (isPunch(id)) analogPunch(p, s, t, id, aim);
  else if (isKick(id)) analogKick(p, s, t, id, aim);
  else if (id === 'grab') extendGrab(p, facing, s, t);
  else if (id === 'shield') raiseGuard(p, facing, s);
  return p;
}

function attackPhase(f) {
  if (!f.attack) return 0;
  const startup = Math.max(1, f.attack.startup || 1);
  const activeEnd = startup + Math.max(1, f.attack.active || 1);
  if (f.attackFrame <= startup) return f.attackFrame / startup * 0.55;
  if (f.attackFrame <= activeEnd) return 1;
  const recovery = Math.max(1, f.attack.recovery || 1);
  return Math.max(0.2, 1 - (f.attackFrame - activeEnd) / recovery * 0.8);
}

function isPunch(id) { return id.includes('jab') || id.includes('Punch') || id === 'uppercut' || id === 'special'; }
function isKick(id) { return id.includes('Kick') || id === 'roundhouse' || id === 'sweep' || id === 'meteorKick'; }

function analogPunch(p, s, t, id, aim) {
  const reach = (id === 'dashPunch' || id === 'chargePunch') ? 134 : id === 'uppercut' ? 126 : 108;
  const draw = 22 * (1 - t) * s;
  twistTorso(p, aim, s, 12 * t, id === 'uppercut' ? -10 * t : 0);
  const shoulder = p.rightShoulder;
  const perp = perpOf(aim);
  p.rightElbow = point(shoulder.x + aim.x * (42 + reach * 0.28 * t) * s + perp.x * draw, shoulder.y + aim.y * (42 + reach * 0.28 * t) * s + perp.y * draw);
  p.rightHand = point(shoulder.x + aim.x * (62 + reach * t) * s, shoulder.y + aim.y * (62 + reach * t) * s);
  p.leftElbow = point(p.leftShoulder.x - aim.x * 22 * s, p.leftShoulder.y - aim.y * 14 * s + 30 * s);
  p.leftHand = point(p.leftShoulder.x - aim.x * 42 * s, p.leftShoulder.y - aim.y * 18 * s + 54 * s);
  if (aim.y < -0.42) p.rightKnee.y -= 10 * t * s;
}

function analogKick(p, s, t, id, aim) {
  const reach = id === 'roundhouse' ? 134 : id === 'aerialKick' ? 144 : id === 'meteorKick' ? 132 : 112;
  const hip = p.rightHip;
  const perp = perpOf(aim);
  const fold = 32 * (1 - t) * s;
  twistTorso(p, aim, s, 18 * t, -12 * Math.abs(aim.y) * t);
  p.rightKnee = point(hip.x + aim.x * (38 + reach * 0.32 * t) * s + perp.x * fold, hip.y + aim.y * (38 + reach * 0.32 * t) * s + perp.y * fold);
  p.rightFoot = point(hip.x + aim.x * (58 + reach * t) * s, hip.y + aim.y * (58 + reach * t) * s);
  p.leftKnee = point(p.leftHip.x - aim.x * 18 * s, p.leftHip.y - aim.y * 12 * s + 42 * s);
  p.leftFoot = point(p.leftHip.x - aim.x * 32 * s, p.leftHip.y - aim.y * 18 * s + 80 * s);
  p.leftHand.x -= aim.x * 24 * t * s;
  p.leftHand.y -= aim.y * 18 * t * s;
  p.rightHand.x -= aim.x * 18 * t * s;
  p.rightHand.y -= aim.y * 14 * t * s;
}

function twistTorso(p, aim, s, lean, lift) {
  p.chest.x -= aim.x * lean * s;
  p.chest.y += lift * s;
  p.head.x -= aim.x * lean * 0.55 * s;
  p.head.y += lift * 0.55 * s;
}

function extendGrab(p, facing, s, t) {
  p.rightElbow = point(p.rightShoulder.x + facing * (42 + 18 * t) * s, p.rightShoulder.y + 26 * s);
  p.rightHand = point(p.rightShoulder.x + facing * (70 + 24 * t) * s, p.rightShoulder.y + 34 * s);
}

function raiseGuard(p, facing, s) {
  p.leftElbow = point(p.chest.x + facing * 18 * s, p.chest.y + 26 * s);
  p.leftHand = point(p.chest.x + facing * 45 * s, p.chest.y + 42 * s);
  p.rightElbow = point(p.chest.x + facing * 18 * s, p.chest.y + 52 * s);
  p.rightHand = point(p.chest.x + facing * 48 * s, p.chest.y + 62 * s);
}

function bindAll(f, p) {
  bind(f, 'spine', p.hip, p.chest); bind(f, 'head', p.neck, p.head);
  bind(f, 'leftUpperArm', p.leftShoulder, p.leftElbow); bind(f, 'leftLowerArm', p.leftElbow, p.leftHand);
  bind(f, 'rightUpperArm', p.rightShoulder, p.rightElbow); bind(f, 'rightLowerArm', p.rightElbow, p.rightHand);
  bind(f, 'leftThigh', p.leftHip, p.leftKnee); bind(f, 'leftCalf', p.leftKnee, p.leftFoot);
  bind(f, 'rightThigh', p.rightHip, p.rightKnee); bind(f, 'rightCalf', p.rightKnee, p.rightFoot);
  bindRoot(f, p.hip);
}

function bind(f, id, root, tip) {
  const bone = f.bones[id]; if (!bone) return;
  bone.root = root; bone.tip = tip;
  bone.angle = Math.atan2(tip.y - root.y, tip.x - root.x);
  bone.len = Math.hypot(tip.x - root.x, tip.y - root.y);
}

function exactAim(aim, facing) {
  const x = Number.isFinite(aim?.x) ? aim.x : facing;
  const y = Number.isFinite(aim?.y) ? aim.y : 0;
  const mag = Math.hypot(x, y) || 1;
  return { x: x / mag, y: y / mag };
}

function perpOf(v) { return { x: -v.y, y: v.x }; }
function bindRoot(f, hip) { if (f.bones.root) { f.bones.root.root = { x: f.x, y: f.y }; f.bones.root.tip = hip; } }
function point(x, y) { return { x, y }; }
