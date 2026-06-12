/**
 * B"H
 * Pose binding.
 *
 * Chapter 20: a pose is only a prophecy until it enters bones. Here the
 * Awtsmoos lets root and tip become a line, and the line becomes readable
 * combat without touching physics or damage.
 */
export function bindAll(f, p) {
  bind(f, 'spine', p.hip, p.chest); bind(f, 'head', p.neck, p.head);
  bind(f, 'leftUpperArm', p.leftShoulder, p.leftElbow); bind(f, 'leftLowerArm', p.leftElbow, p.leftHand);
  bind(f, 'rightUpperArm', p.rightShoulder, p.rightElbow); bind(f, 'rightLowerArm', p.rightElbow, p.rightHand);
  bind(f, 'leftThigh', p.leftHip, p.leftKnee); bind(f, 'leftCalf', p.leftKnee, p.leftFoot);
  bind(f, 'rightThigh', p.rightHip, p.rightKnee); bind(f, 'rightCalf', p.rightKnee, p.rightFoot);
  bindRoot(f, p.hip);
}

function bind(f, id, root, tip) {
  const bone = f.bones[id];
  if (!bone) return;
  bone.root = root; bone.tip = tip;
  bone.angle = Math.atan2(tip.y - root.y, tip.x - root.x);
  bone.len = Math.hypot(tip.x - root.x, tip.y - root.y);
}

function bindRoot(f, hip) {
  if (!f.bones.root) return;
  f.bones.root.root = { x: f.x, y: f.y };
  f.bones.root.tip = hip;
}
