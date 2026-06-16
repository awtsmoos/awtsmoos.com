import { resolvePose } from '../js/render/v3/character/animation/AnimationController.js';

function assert(ok, msg) { if (!ok) throw new Error(msg); }
function fighter(patch = {}) { return { x: 0, y: 0, face: 1, grounded: true, vx: 0, vy: 0, motionClock: 0, dna: { hue: 120 }, stocks: 3, damage: 0, ...patch }; }
function check(name, patch, options = {}) {
  const p = resolvePose(fighter(patch));
  const height = Math.max(p.leftFoot.y, p.rightFoot.y) - p.head.y;
  const shoulder = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hip = Math.abs(p.rightHip.x - p.leftHip.x);
  const headGap = Math.hypot(p.head.x - p.neck.x, p.head.y - p.neck.y);
  assert(height >= 170 && height <= 185, `${name}: height ${height}`);
  assert(shoulder / hip >= 2.2, `${name}: weak ratio ${shoulder / hip}`);
  assert(headGap <= 24, `${name}: detached head ${headGap}`);
  if (!options.highKick) assert(p.leftFoot.y > p.leftKnee.y && p.rightFoot.y > p.rightKnee.y, `${name}: bad feet`);
  return { name, height, shoulder, hip, ratio: +(shoulder / hip).toFixed(2), headGap: +headGap.toFixed(1) };
}
const cases = [
  check('idle', {}),
  check('run', { vx: 7, motionClock: 20 }),
  check('jump', { grounded: false, vy: -7 }),
  check('fall', { grounded: false, vy: 7 }),
  check('punch', { attack: { id: 'chargePunch', startup: 9, active: 6, recovery: 8 }, attackFrame: 8 }),
  check('kick', { attack: { id: 'roundhouse', startup: 5, active: 8, recovery: 8 }, attackFrame: 8 }, { highKick: true }),
  check('hitstun', { stun: 24, damage: 160, vx: -6 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
