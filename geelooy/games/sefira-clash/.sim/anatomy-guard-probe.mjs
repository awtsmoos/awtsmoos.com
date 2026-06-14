import { fighter, finite } from './animation-probe-lib.mjs';

function length(bone) {
  return Math.hypot(bone.tip.x - bone.root.x, bone.tip.y - bone.root.y);
}

function checkCase(name, patch) {
  const f = fighter(patch);
  finite(f);
  const failures = [];
  for (const id of ['leftThigh', 'leftCalf', 'rightThigh', 'rightCalf']) {
    const len = length(f.bones[id]);
    if (len < 18 || len > 88) failures.push(`${name}:${id}:badLength:${len.toFixed(1)}`);
  }
  for (const side of ['left', 'right']) {
    const hip = f.bones[side + 'Thigh'].root;
    const knee = f.bones[side + 'Thigh'].tip;
    const foot = f.bones[side + 'Calf'].tip;
    if (knee.y < hip.y - 8) failures.push(`${name}:${side}:kneeAboveHip`);
    if (foot.y < knee.y - 16) failures.push(`${name}:${side}:footAboveKnee`);
  }
  return { name, failures, leftFoot: f.bones.leftCalf.tip, rightFoot: f.bones.rightCalf.tip };
}

const cases = [
  checkCase('idle', {}),
  checkCase('walkRight', { vx: 6, input: { x: 1 }, motionClock: 18 }),
  checkCase('walkLeft', { vx: -6, face: -1, input: { x: -1 }, motionClock: 33 }),
  checkCase('hitstun', { damage: 170, stun: 24, vx: -8, vy: -4 }),
  checkCase('charge', { attack: { id: 'chargePunch', fullCharge: true }, attackFrame: 10 }),
  checkCase('rapid', { rapidAttack: { id: 'jab1', rapid: true }, rapidAttackFrame: 4, vx: 5 })
];
const failures = cases.flatMap(c => c.failures);
if (failures.length) throw new Error(failures.join('\n'));
console.log(JSON.stringify({ ok: true, cases }, null, 2));
