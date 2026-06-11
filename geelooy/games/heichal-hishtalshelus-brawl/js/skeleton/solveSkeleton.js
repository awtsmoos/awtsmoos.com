/**
 * B"H
 * Humanoid animation solver, second repair.
 *
 * The body now stands taller, with real shoulders, elbows, hands, hips, knees,
 * and feet. Movement creates a readable walk cycle; punch and kick extend from
 * the correct side of the torso instead of folding into an insect-cloud.
 */
export function solveSkeleton(f) {
  const s = Math.max(0.9, Math.min(1.15, f.dna.height || 1));
  const facing = f.face || 1;
  const speed = Math.min(1, Math.abs(f.vx) / 8);
  const clock = typeof performance === 'undefined' ? 0 : performance.now();
  const walk = Math.sin(clock / 90 + f.x * 0.05) * speed;
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
  const chest = point(f.x + facing * (3 + walk * 2), f.y - 128 * s);
  const neck = point(chest.x, chest.y - 13 * s);
  const head = point(chest.x, chest.y - 42 * s);
  const sw = 31 * s;
  const hw = 18 * s;
  return {
    hip, chest, neck, head,
    leftShoulder: point(chest.x - sw, chest.y + 14 * s),
    rightShoulder: point(chest.x + sw, chest.y + 14 * s),
    leftHip: point(hip.x - hw, hip.y + 3 * s),
    rightHip: point(hip.x + hw, hip.y + 3 * s),
    leftElbow: point(chest.x - sw - 18 * s - walk * 13 * s, chest.y + 52 * s),
    leftHand: point(chest.x - sw - 26 * s - walk * 22 * s, chest.y + 90 * s),
    rightElbow: point(chest.x + sw + 18 * s + walk * 13 * s, chest.y + 52 * s),
    rightHand: point(chest.x + sw + 26 * s + walk * 22 * s, chest.y + 90 * s),
    leftKnee: point(hip.x - hw - walk * 20 * s, hip.y + 53 * s),
    leftFoot: point(hip.x - hw - walk * 32 * s, f.y + 2),
    rightKnee: point(hip.x + hw + walk * 20 * s, hip.y + 53 * s),
    rightFoot: point(hip.x + hw + walk * 32 * s, f.y + 2)
  };
}

function actionPose(f, p, facing, s) {
  const action = f.blocking ? 'shield' : f.attack?.id || '';
  const progress = f.attack ? Math.min(1, f.attackFrame / Math.max(1, f.attack.startup + 2)) : 1;
  if (action === 'punch' || action === 'special') extendPunch(p, facing, s, progress);
  if (action === 'kick') extendKick(p, facing, s, progress);
  if (action === 'grab') extendGrab(p, facing, s, progress);
  if (action === 'shield') raiseGuard(p, facing, s);
  return p;
}

function extendPunch(p, facing, s, t) {
  p.chest.x -= facing * 7 * s;
  p.rightShoulder.x += facing * 11 * s;
  p.rightElbow = point(p.rightShoulder.x + facing * (34 + 22 * t) * s, p.rightShoulder.y + (18 - 12 * t) * s);
  p.rightHand = point(p.rightShoulder.x + facing * (72 + 32 * t) * s, p.rightShoulder.y + (14 - 16 * t) * s);
  p.leftElbow = point(p.leftShoulder.x - facing * 20 * s, p.leftShoulder.y + 28 * s);
  p.leftHand = point(p.leftShoulder.x - facing * 32 * s, p.leftShoulder.y + 52 * s);
}

function extendKick(p, facing, s, t) {
  p.chest.x -= facing * 10 * s;
  p.rightKnee = point(p.rightHip.x + facing * (44 + 18 * t) * s, p.rightHip.y + (30 - 18 * t) * s);
  p.rightFoot = point(p.rightHip.x + facing * (82 + 28 * t) * s, p.rightHip.y + (32 - 20 * t) * s);
  p.leftKnee.y += 7 * s;
  p.leftFoot.x -= facing * 10 * s;
}

function extendGrab(p, facing, s, t) {
  p.rightElbow = point(p.rightShoulder.x + facing * (36 + 10 * t) * s, p.rightShoulder.y + 28 * s);
  p.rightHand = point(p.rightShoulder.x + facing * (66 + 14 * t) * s, p.rightShoulder.y + 38 * s);
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

function point(x, y) {
  return { x, y };
}
