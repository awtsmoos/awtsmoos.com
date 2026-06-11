/**
 * B"H
 * Humanoid animation solver with real combat poses.
 *
 * Chapter 79: the fist finally leaves the body and the foot finally cuts the
 * air. Attack names are not generic; jab1, jab2, jab3, dashPunch, sweep,
 * roundhouse, aerialKick, and meteorKick all become visible body language.
 */
export function solveSkeleton(f) {
  const s = Math.max(0.9, Math.min(1.15, f.dna.height || 1));
  const facing = f.face || 1;
  const speed = Math.min(1.25, Math.abs(f.vx) / 10);
  const clock = f.motionClock || 0;
  const walk = Math.sin(clock * 0.42 + f.x * 0.04) * speed;
  const p = actionPose(f, basePose(f, facing, walk, s), facing, s);
  bind(f, 'spine', p.hip, p.chest);
  bind(f, 'head', p.neck, p.head);
  bind(f, 'leftUpperArm', p.leftShoulder, p.leftElbow);
  bind(f, 'leftLowerArm', p.leftElbow, p.leftHand);
  bind(f, 'rightUpperArm', p.rightShoulder, p.rightElbow);
  bind(f, 'rightLowerArm', p.rightElbow, p.rightHand);
  bind(f, 'leftThigh', p.leftHip, p.leftKnee);
  bind(f, 'leftCalf', p.leftKnee, p.leftFoot);
  bind(f, 'rightThigh', p.rightHip, p.rightKnee);
  bind(f, 'rightCalf', p.rightKnee, p.rightFoot);
  bindRoot(f, p.hip);
}

function basePose(f, facing, walk, s) {
  const hip = point(f.x, f.y - 56 * s);
  const chest = point(f.x + facing * (4 + walk * 4), f.y - 128 * s);
  const neck = point(chest.x, chest.y - 13 * s);
  const head = point(chest.x + facing * Math.abs(f.vx) * 0.35, chest.y - 42 * s);
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

function actionPose(f, p, facing, s) {
  const id = f.blocking ? 'shield' : f.attack?.id || '';
  const t = attackPhase(f);
  if (isPunch(id)) extendPunch(p, facing, s, t, id);
  else if (isKick(id)) extendKick(p, facing, s, t, id);
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

function isPunch(id) {
  return id.includes('jab') || id.includes('Punch') || id === 'uppercut' || id === 'special';
}

function isKick(id) {
  return id.includes('Kick') || id === 'roundhouse' || id === 'sweep';
}

function extendPunch(p, facing, s, t, id) {
  const upper = id === 'uppercut';
  const reach = id === 'dashPunch' || id === 'chargePunch' ? 126 : 102;
  const lift = upper ? -70 : -16;
  p.chest.x -= facing * 9 * s;
  p.chest.y += upper ? 7 * s : 0;
  p.rightShoulder.x += facing * 13 * s;
  p.rightElbow = point(p.rightShoulder.x + facing * (40 + reach * 0.28 * t) * s, p.rightShoulder.y + (18 + lift * 0.35 * t) * s);
  p.rightHand = point(p.rightShoulder.x + facing * (58 + reach * t) * s, p.rightShoulder.y + (14 + lift * t) * s);
  p.leftElbow = point(p.leftShoulder.x - facing * 22 * s, p.leftShoulder.y + 26 * s);
  p.leftHand = point(p.leftShoulder.x - facing * 38 * s, p.leftShoulder.y + 50 * s);
}

function extendKick(p, facing, s, t, id) {
  const sweep = id === 'sweep';
  const meteor = id === 'meteorKick';
  const height = meteor ? 80 : sweep ? 58 : 28;
  const reach = id === 'roundhouse' ? 118 : id === 'aerialKick' ? 128 : 104;
  p.chest.x -= facing * 13 * s;
  p.chest.y += 6 * s;
  p.rightKnee = point(p.rightHip.x + facing * (42 + 24 * t) * s, p.rightHip.y + (height - 26 * t) * s);
  p.rightFoot = point(p.rightHip.x + facing * (54 + reach * t) * s, p.rightHip.y + (height - 34 * t) * s);
  p.leftKnee.y += 10 * s;
  p.leftFoot.x -= facing * 14 * s;
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

function bind(f, id, root, tip) {
  const bone = f.bones[id];
  if (!bone) return;
  bone.root = root;
  bone.tip = tip;
  bone.angle = Math.atan2(tip.y - root.y, tip.x - root.x);
  bone.len = Math.hypot(tip.x - root.x, tip.y - root.y);
}

function bindRoot(f, hip) {
  if (!f.bones.root) return;
  f.bones.root.root = { x: f.x, y: f.y };
  f.bones.root.tip = hip;
}

function point(x, y) { return { x, y }; }
