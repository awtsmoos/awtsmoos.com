import { fighter } from './animation-probe-lib.mjs';
import { capsulePoints } from '../js/render/fighter/capsule/points.js';
import { dist } from '../js/render/fighter/capsule/math.js';

function assert(c, m) { if (!c) throw new Error(m); }
function finite(p, name) { assert(p && Number.isFinite(p.x) && Number.isFinite(p.y), `bad ${name}`); }

function check(name, patch) {
  const f = fighter(patch);
  const p = capsulePoints(f);
  for (const [k, v] of Object.entries(p)) if (k !== 'face') finite(v, `${name}:${k}`);
  const shoulderW = Math.abs(p.rightShoulder.x - p.leftShoulder.x);
  const hipW = Math.abs(p.rightHip.x - p.leftHip.x);
  const headGap = dist(p.head, p.neck);
  const leftArm = dist(p.leftShoulder, p.leftElbow) + dist(p.leftElbow, p.leftHand);
  const rightArm = dist(p.rightShoulder, p.rightElbow) + dist(p.rightElbow, p.rightHand);
  const leftLeg = dist(p.leftHip, p.leftKnee) + dist(p.leftKnee, p.leftFoot);
  const rightLeg = dist(p.rightHip, p.rightKnee) + dist(p.rightKnee, p.rightFoot);
  assert(headGap >= 18 && headGap <= 24, `${name}:headGap:${headGap}`);
  assert(shoulderW >= 64 && shoulderW <= 72, `${name}:shoulderW:${shoulderW}`);
  assert(hipW >= 28 && hipW <= 34, `${name}:hipW:${hipW}`);
  assert(shoulderW > hipW * 1.9, `${name}:weakSilhouette`);
  assert(p.leftFoot.y > p.leftKnee.y && p.rightFoot.y > p.rightKnee.y, `${name}:feetNotBelowKnees`);
  assert(p.leftKnee.y > p.leftHip.y && p.rightKnee.y > p.rightHip.y, `${name}:kneesNotBelowHips`);
  assert(leftArm >= 45 && leftArm <= 135 && rightArm >= 45 && rightArm <= 135, `${name}:armLength`);
  assert(leftLeg >= 76 && leftLeg <= 132 && rightLeg >= 76 && rightLeg <= 132, `${name}:legLength`);
  return { name, headGap: +headGap.toFixed(1), shoulderW, hipW, leftArm: +leftArm.toFixed(1), leftLeg: +leftLeg.toFixed(1) };
}

const cases = [
  check('idle', {}),
  check('runRight', { vx: 7, input: { x: 1 }, motionClock: 19 }),
  check('runLeft', { vx: -7, face: -1, input: { x: -1 }, motionClock: 42 }),
  check('jump', { grounded: false, vy: -8 }),
  check('fall', { grounded: false, vy: 8 }),
  check('chargePunch', { attack: { id: 'chargePunch', fullCharge: true, startup: 9, active: 6, recovery: 8 }, attackFrame: 9 }),
  check('rapid', { rapidAttack: { id: 'jab1', rapid: true, startup: 1, active: 5, recovery: 6 }, rapidAttackFrame: 3 }),
  check('kick', { attack: { id: 'roundhouse', startup: 5, active: 8, recovery: 8 }, attackFrame: 8 }),
  check('stun', { damage: 160, stun: 24, vx: -7 })
];
console.log(JSON.stringify({ ok: true, cases }, null, 2));
